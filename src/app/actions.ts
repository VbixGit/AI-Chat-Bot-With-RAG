'use server';

import { generateQuestionEmbedding } from '@/ai/flows/question-embedding';
import type { Citation, ServerActionResponse, Message } from '@/lib/types';

async function classifyQuestion(question: string): Promise<string> {
  console.log('Step 2.1: Classifying question...');
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiChatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

  if (!openAiApiKey) {
    throw new Error('OpenAI API key is not set.');
  }

  const systemPrompt = `You are a helpful AI assistant. Your task is to classify the user's question into one of two categories: "Policy" or "Resume". 
  Respond with only "Policy" or "Resume".`;
  
  const userPrompt = `Question: ${question}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiChatModel,
      temperature: 0,
      messages: messages,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI chat completion failed with status ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  let classification = json.choices[0].message.content.trim();

  // Basic validation to ensure the classification is one of the expected values.
  if (classification !== 'Policy' && classification !== 'Resume') {
    console.warn(`Unexpected classification result: "${classification}". Defaulting to "Policy".`);
    classification = 'Policy'; 
  }

  console.log(`Step 2.2: Classified question as "${classification}"`);
  return classification;
}


async function searchWeaviate(vector: number[], classification: string): Promise<any[]> {
  console.log(`Step 4: Searching Weaviate with the embedding vector for classification: ${classification}...`);
  const weaviateEndpoint = process.env.WEAVIATE_ENDPOINT;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  const topK = process.env.TOP_K || '5';

  if (!weaviateEndpoint || !weaviateApiKey) {
    throw new Error('Weaviate environment variables are not set.');
  }

  const className = classification === 'Policy' ? 'TestPolicyUpload' : 'ApplicantCV';

  const query = `
    {
      Get {
        ${className}(
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

  const results = json.data.Get[className] || [];
  console.log(`Step 5: Found ${results.length} documents in Weaviate`);

  return results;
}

async function generateAnswer(
  context: string,
  question: string,
  chatHistory: Message[]
): Promise<string> {
  console.log('Step 7: Generating answer with context using OpenAI...');
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiChatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

  if (!openAiApiKey) {
    throw new Error('OpenAI API key is not set.');
  }

  const systemPrompt = `You are a helpful AI assistant. Your task is to answer the user's question based on the provided context and chat history. 
  Synthesize the information from the documents to provide a comprehensive and natural-sounding answer. 
  If the information is not in the context, say that you couldn't find the information. Do not make up information. 
  Maintain a conversational and friendly tone, like a human would.
  If the user's question is a follow-up to a previous question, use the chat history to understand the context of the conversation.`;
  
  const userPrompt = `Question: ${question}\n\nContext:\n${context}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userPrompt },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiChatModel,
      temperature: 0.2,
      messages: messages,
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

export async function askQuestion(
  question: string,
  chatHistory: Message[] = []
): Promise<ServerActionResponse> {
  console.log(`Step 1: Get text from user: "${question}"`);
  try {
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (!openAiApiKey) {
      throw new Error('OpenAI API key is not set for embedding and answer generation.');
    }

    const classification = await classifyQuestion(question);

    console.log('Step 2: Embedding text using OpenAI...');
    const { embedding } = await generateQuestionEmbedding({
      question,
      modelProvider: 'openai',
      openAiApiKey,
    });
    console.log(`Step 3: Embedding data: {*embedding data of length ${embedding.length}*}`);

    const docs = await searchWeaviate(embedding, classification);
    console.log(`Step 6: Using all ${docs.length} documents from Weaviate.`);

    if (docs.length === 0) {
      return {
        answer: "I couldn't find any information matching your question. Please try rephrasing it.",
        citations: [],
      };
    }

    const context = docs
      .map((d, i) => {
        return `Document #${i + 1}:
- Description: ${d.description}
- Content: ${d.content}
- Source: ${d.source}
- Requester: ${d.requesterName} <${d.requesterEmail}>
- PDF File ID: ${d.pdfFileId}
- Instance ID: ${d.instanceID}
- Chunk Index: ${d.chunkIndex}
- Chunk Count: ${d.chunkCount}
- Chunk ID: ${d.chunkId}
- Relevance Score (distance): ${d._additional.distance}`;
      })
      .join('\n\n---\n\n');

    const answer = await generateAnswer(context, question, chatHistory);

    const citations: Citation[] = docs.map((d, i) => ({
      index: i + 1,
      title: d.description || `Document ${i + 1}`,
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