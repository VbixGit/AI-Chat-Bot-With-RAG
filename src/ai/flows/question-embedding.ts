'use server';
/**
 * @fileOverview Generates embeddings for user questions using either OpenAI or Cohere.
 *
 * - generateQuestionEmbedding - A function that generates an embedding for a given question.
 * - QuestionEmbeddingInput - The input type for the generateQuestionEmbedding function.
 * - QuestionEmbeddingOutput - The return type for the generateQuestionEmbedding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionEmbeddingInputSchema = z.object({
  question: z.string().describe('The question to generate an embedding for.'),
  modelProvider: z.enum(['openai', 'cohere']).default('openai').describe('The embedding model provider to use.'),
  openAiApiKey: z.string().optional().describe('The OpenAI API key.'),
  cohereApiKey: z.string().optional().describe('The Cohere API key.'),
});
export type QuestionEmbeddingInput = z.infer<typeof QuestionEmbeddingInputSchema>;

const QuestionEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding for the question.'),
});
export type QuestionEmbeddingOutput = z.infer<typeof QuestionEmbeddingOutputSchema>;

export async function generateQuestionEmbedding(input: QuestionEmbeddingInput): Promise<QuestionEmbeddingOutput> {
  console.log(`Step 2a: Calling Genkit flow to generate embedding for question: "${input.question}" using ${input.modelProvider}`);
  return questionEmbeddingFlow(input);
}

const questionEmbeddingFlow = ai.defineFlow(
  {
    name: 'questionEmbeddingFlow',
    inputSchema: QuestionEmbeddingInputSchema,
    outputSchema: QuestionEmbeddingOutputSchema,
  },
  async input => {
    const {
      question,
      modelProvider,
      openAiApiKey,
      cohereApiKey,
    } = input;

    let embedding: number[];

    if (modelProvider === 'openai') {
        if (!openAiApiKey) {
            throw new Error('OpenAI API key is required for OpenAI embeddings.');
        }
        console.log('Step 2b: Calling OpenAI Embeddings API...');
        const res = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: question,
                model: 'text-embedding-3-small',
            }),
        });
        const json = await res.json();
        embedding = json.data[0].embedding;
    } else if (modelProvider === 'cohere') {
        if (!cohereApiKey) {
            throw new Error('Cohere API key is required for Cohere embeddings.');
        }
        console.log('Step 2b: Calling Cohere Embeddings API...');
        const res = await fetch('https://api.cohere.ai/v1/embed', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${cohereApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                texts: [question],
                model: 'embed-english-v3.0',
                input_type: 'search_query',
            }),
        });
        const json = await res.json();
        embedding = json.embeddings[0];
    } else {
        throw new Error(`Unsupported model provider: ${modelProvider}`);
    }
    
    console.log('Step 2c: Successfully generated embedding');

    return {
      embedding: embedding,
    };
  }
);
