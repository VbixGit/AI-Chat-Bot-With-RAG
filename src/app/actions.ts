'use server';

import { generateQuestionEmbedding } from '@/ai/flows/question-embedding';
import type { WeaviateDocument, Citation, ServerActionResponse } from '@/lib/types';

async function searchWeaviate(vector: number[]): Promise<WeaviateDocument[]> {
  console.log('Step 4: Searching Weaviate with the embedding vector...');
  const weaviateEndpoint = process.env.WEAVIATE_ENDPOINT;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  const topK = process.env.TOP_K || '5';

  if (!weaviateEndpoint || !weaviateApiKey) {
    throw new Error('Weaviate environment variables are not set.');
  }

  const query = `
    {
      Get {
        UserName(
          nearVector: { vector: ${JSON.stringify(vector)} }
          limit: ${topK}
        ) {
          title
          email
          instanceID
          status
          content
          pdfText
          _additional { distance }
        }
      }
    }
  `;

  const res = await fetch(`${weaviateEndpoint}/v1/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${weaviateApiKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Weaviate query failed with status ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Weaviate GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  const results = json.data.Get.UserName || [];
  console.log(`Step 5: Found ${results.length} documents in Weaviate`);

  return results.map((doc: any) => ({
    title: doc.title,
    text: doc.content || doc.pdfText,
    source: doc.instanceID,
    email: doc.email,
    status: doc.status,
    _additional: doc._additional,
  }));
}

async function generateAnswer(context: string, question: string): Promise<string> {
  console.log('Step 7: Generating answer with context...');
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiChatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

  if (!openAiApiKey) {
    throw new Error('OpenAI API key is not set.');
  }

  const systemPrompt = `You are VectorSage, a friendly and intelligent AI assistant. Your goal is to provide helpful and comprehensive answers to the user's questions based on the information provided in the Context.

- Synthesize the information from the Context to answer the user's question thoroughly.
- If the Context doesn't contain a direct answer, try to infer one or explain what information is available.
- If you cannot answer the question at all with the given context, politely state that you couldn't find the specific information.
- Answer in a conversational and helpful tone.`;
  const userPrompt = `Question: ${question}\n\nContext:\n${context}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiChatModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI chat completion failed with status ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  const answer = json.choices[0].message.content.trim();
  console.log(`Step 8: Generated answer: "${answer}"`);
  return answer;
}

export async function askQuestion(question: string): Promise<ServerActionResponse> {
  console.log(`Step 1: Get text from user: "${question}"`);
  try {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const scoreThreshold = parseFloat(process.env.SCORE_THRESHOLD || '0.7');

    if (!openAiApiKey) {
      throw new Error('OpenAI API key is not set.');
    }

    console.log('Step 2: Embedding text...');
    const { embedding } = await generateQuestionEmbedding({
      question,
      openAiApiKey,
    });
    console.log(`Step 3: Embedding data: {*embedding data of length ${embedding.length}*}`);

    const docs = await searchWeaviate(embedding);

    const filteredDocs = docs.filter(
      (doc) => doc._additional.distance < scoreThreshold
    );
    console.log(`Step 6: Filtered down to ${filteredDocs.length} documents based on score threshold of ${scoreThreshold}`);

    if (filteredDocs.length === 0) {
      return {
        answer: "I couldn't find any information matching your question. Please try rephrasing it.",
        citations: [],
      };
    }

    const context = filteredDocs
      .map((d, i) => `
        Document #${i + 1}:
        - Title: ${d.title}
        - Source: ${d.source}
        - Email: ${d.email}
        - Status: ${d.status}
        - Content: ${d.text}
        - PdfText: ${d.pdfText}
      `)
      .join('\n\n');

    const answer = await generateAnswer(context, question);

    const citations: Citation[] = filteredDocs.map((d, i) => ({
      index: i + 1,
      title: d.title,
      source: d.source,
    }));
    
    const response = { answer, citations };
    console.log('Step 9: Returning final response:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('Error in askQuestion:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { error: `Internal server error: ${errorMessage}` };
  }
}
