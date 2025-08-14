import type { ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string | ReactNode;
  citations?: Citation[];
};

export type Citation = {
  index: number;
  title: string;
  source: string;
};

export type WeaviateDocument = {
  title: string;
  text: string;
  source: string;
  _additional: {
    distance: number;
  };
};

export type ServerActionResponse = {
    answer: string;
    citations: Citation[];
} | {
    error: string;
};
