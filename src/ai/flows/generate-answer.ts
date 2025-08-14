'use server';
/**
 * @fileOverview Generates an answer to a question using OpenAI GPT-4o, based on the retrieved context from Weaviate.
 *
 * - generateAnswer - A function that handles the answer generation process.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  context: z.string().describe('The retrieved context from Weaviate.'),
  question: z.string().describe('The user question.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The generated answer to the question.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {schema: GenerateAnswerInputSchema},
  output: {schema: GenerateAnswerOutputSchema},
  prompt: `You are a retrieval-augmented assistant. Use ONLY the provided Context to answer the question.\nIf the answer is not in the Context, reply exactly: "No matching information found."\n\nQuestion: {{{question}}}\n\nContext:\n{{{context}}}`,
});

const generateAnswerFlow = ai.defineFlow(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
