'use server';

import { generateQuestionEmbedding } from '@/ai/flows/question-embedding';
import type { WeaviateDocument, Citation, ServerActionResponse } from '@/lib/types';

async function searchWeaviate(vector: number[]): Promise<WeaviateDocument[]> {
  console.log('Step 4: Searching Weaviate with the embedding vector...');
  const weaviateEndpoint = process.env.WEAVIATE_ENDPOINT;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  const topK = process.env.TOP_K || '5'; // Reduced from 5 to 3 to lower token count

  if (!weaviateEndpoint || !weaviateApiKey) {
    throw new Error('Weaviate environment variables are not set.');
  }

  const query = `
    {
      Get {
        TestPolicyUpload(
          nearVector: { vector: ${JSON.stringify(vector)} }
          limit: ${topK}
        ) {
          description
          instanceID
          requesterName
          requesterEmail
          pdfFileId
          content
          chunkIndex
          chunkCount
          source
          chunkId
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

  const results = json.data.Get.PolicyBaseMoreTK || [];
  console.log(`Step 5: Found ${results.length} documents in Weaviate`);

  return results.map((doc: any) => ({
    title: doc.title,
    text: doc.content,
    pdfText: doc.pdfText,
    source: doc.instanceID,
    _additional: doc._additional,
  }));
}

async function generateAnswer(context: string, question: string): Promise<string> {
  console.log('Step 7: Generating answer with context using OpenAI...');
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiChatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

  if (!openAiApiKey) {
    throw new Error('OpenAI API key is not set.');
  }

  const systemPrompt = `You are a helpful AI assistant. Your task is to answer the user's question based on the provided context. 
  Synthesize the information from the documents to provide a comprehensive and natural-sounding answer. 
  If the information is not in the context, say that you couldn't find the information. Do not make up information. 
  Respond in a conversational and friendly tone, like a human would.`;
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
    const cohereApiKey = process.env.COHERE_API_KEY;

    if (!cohereApiKey) {
      throw new Error('Cohere API key is not set for embedding.');
    }
    if (!openAiApiKey) {
      throw new Error('OpenAI API key is not set for answer generation.');
    }

    console.log('Step 2: Embedding text using Cohere...');
    const { embedding } = await generateQuestionEmbedding({
      question,
      modelProvider: 'cohere',
      cohereApiKey,
    });
    console.log(`Step 3: Embedding data: {*embedding data of length ${embedding.length}*}`);

    const docs = await searchWeaviate(embedding);
    console.log(`Step 6: Using all ${docs.length} documents from Weaviate.`);

    if (docs.length === 0) {
      return {
        answer: "I couldn't find any information matching your question. Please try rephrasing it.",
        citations: [],
      };
    }

    const context = docs
      .map((d, i) => {
        const parts = [
            `Document #${i + 1}:`,
            `- Title: ${d.title}`,
            `- Source: ${d.source}`
        ];
        if (d.text) {
            parts.push(`- Content: ${d.text}`);
        }
        if (d.pdfText) {
            parts.push(`- PdfText: ${d.pdfText}`);
        }
        return parts.join('\n');
      })
      .join('\n\n');

    const answer = await generateAnswer(context, question);

    const citations: Citation[] = docs.map((d, i) => ({
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
