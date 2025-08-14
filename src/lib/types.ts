export interface Citation {
  index: number;
  title: string;
  source: string;
}

export interface WeaviateDocument {
  title: string;
  text: string;
  source: string;
  email?: string;
  status?: string;
  pdfText?: string;
  _additional: {
    distance: number;
  };
}

export type ServerActionResponse =
  | {
      answer: string;
      citations: Citation[];
    }
  | {
      error: string;
    };

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
