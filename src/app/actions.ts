'use server';

import { generateQuestionEmbedding } from '@/ai/flows/question-embedding';
import type { WeaviateDocument, Citation, ServerActionResponse } from '@/lib/types';

async function searchWeaviate(vector: number[]): Promise<WeaviateDocument[]> {
  const weaviateEndpoint = process.env.WEAVIATE_ENDPOINT;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  const topK = process.env.TOP_K || '5';

  if (!weaviateEndpoint || !weaviateApiKey) {
    throw new Error('Weaviate environment variables are not set.');
  }

  const query = `
    {
      Get {
        VectorSage(
          nearVector: { vector: ${JSON.stringify(vector)} }
          limit: ${topK}
        ) {
          title
          text
          source
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
  
  return json.data.Get.VectorSage || [];
}

async function generateAnswer(context: string, question: string): Promise<string> {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const openAiChatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o';

  if (!openAiApiKey) {
    throw new Error('OpenAI API key is not set.');
  }

  const systemPrompt = `You are a retrieval-augmented assistant. Use ONLY the provided Context to answer the question.\nIf the answer is not in the Context, reply exactly: "No matching information found."`;
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
  return json.choices[0].message.content.trim();
}

export async function askQuestion(question: string): Promise<ServerActionResponse> {
  try {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const scoreThreshold = parseFloat(process.env.SCORE_THRESHOLD || '0.35');

    if (!openAiApiKey) {
      throw new Error('OpenAI API key is not set.');
    }

    const { embedding } = await generateQuestionEmbedding({
      question,
      openAiApiKey,
    });

    const docs = await searchWeaviate(embedding);
    
    const filteredDocs = docs.filter(
        (doc) => doc._additional.distance < scoreThreshold
    );

    if (filteredDocs.length === 0) {
      return {
        answer: "I couldn't find any information matching your question. Please try rephrasing it.",
        citations: [],
      };
    }

    const context = filteredDocs
      .map((d, i) => `#${i + 1} [${d.title}] (${d.source})\n${d.text}`)
      .join('\n\n');

    const answer = await generateAnswer(context, question);

    const citations: Citation[] = filteredDocs.map((d, i) => ({
      index: i + 1,
      title: d.title,
      source: d.source,
    }));

    return { answer, citations };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { error: `Internal server error: ${errorMessage}` };
  }
}
