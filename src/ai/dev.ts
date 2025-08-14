import { config } from 'dotenv';
config();

import '@/ai/flows/question-embedding.ts';
import '@/ai/flows/generate-answer.ts';
import '@/ai/flows/query-weaviate.ts';