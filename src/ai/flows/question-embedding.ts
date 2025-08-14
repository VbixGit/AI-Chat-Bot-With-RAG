'use server';
/**
 * @fileOverview Generates embeddings for user questions using the OpenAI Embeddings API.
 *
 * - generateQuestionEmbedding - A function that generates an embedding for a given question.
 * - QuestionEmbeddingInput - The input type for the generateQuestionEmbedding function.
 * - QuestionEmbeddingOutput - The return type for the generateQuestionEmbedding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionEmbeddingInputSchema = z.object({
  question: z.string().describe('The question to generate an embedding for.'),
  openAiApiKey: z.string().describe('The OpenAI API key.'),
});
export type QuestionEmbeddingInput = z.infer<typeof QuestionEmbeddingInputSchema>;

const QuestionEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding for the question.'),
});
export type QuestionEmbeddingOutput = z.infer<typeof QuestionEmbeddingOutputSchema>;

export async function generateQuestionEmbedding(input: QuestionEmbeddingInput): Promise<QuestionEmbeddingOutput> {
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
      openAiApiKey,
    } = input;

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
    const embedding = json.data[0].embedding;

    return {
      embedding: embedding,
    };
  }
);
