'use server';

/**
 * @fileOverview Queries Weaviate with an embedding vector to retrieve relevant information.
 *
 * - searchWeaviate - A function that queries Weaviate with an embedding vector.
 * - SearchWeaviateInput - The input type for the searchWeaviate function.
 * - SearchWeaviateOutput - The return type for the searchWeaviate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchWeaviateInputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding vector to use for querying Weaviate.'),
});
export type SearchWeaviateInput = z.infer<typeof SearchWeaviateInputSchema>;

const WeaviateDocumentSchema = z.object({
  title: z.string().describe('The title of the document.'),
  text: z.string().describe('The content of the document.'),
  source: z.string().describe('The source URL of the document.'),
  _additional: z.object({
    distance: z.number().describe('The distance between the embedding vector and the document.'),
  }).describe('Additional information about the document.'),
});

const SearchWeaviateOutputSchema = z.array(WeaviateDocumentSchema).describe('The documents retrieved from Weaviate.');
export type SearchWeaviateOutput = z.infer<typeof SearchWeaviateOutputSchema>;

export async function searchWeaviate(input: SearchWeaviateInput): Promise<SearchWeaviateOutput> {
  return searchWeaviateFlow(input);
}

const searchWeaviatePrompt = ai.definePrompt({
  name: 'searchWeaviatePrompt',
  input: {schema: SearchWeaviateInputSchema},
  output: {schema: SearchWeaviateOutputSchema},
  prompt: `You are a search assistant that queries a Weaviate database using a vector embedding.

  The database contains documents with titles, text, and source URLs.
  The goal is to retrieve relevant documents based on the provided embedding vector.

  Here's the embedding vector you will be searching with: {{{embedding}}}

  Return the documents retrieved from Weaviate in the specified output schema.
`,
});

const searchWeaviateFlow = ai.defineFlow(
  {
    name: 'searchWeaviateFlow',
    inputSchema: SearchWeaviateInputSchema,
    outputSchema: SearchWeaviateOutputSchema,
  },
  async input => {
    const {output} = await searchWeaviatePrompt(input);
    return output!;
  }
);
