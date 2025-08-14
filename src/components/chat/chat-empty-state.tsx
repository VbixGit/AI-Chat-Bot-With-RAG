'use client';

import { Button } from '@/components/ui/button';

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  const suggestions = [
    'What are the key features of VectorSage?',
    'How does the answer generation work?',
    'What is the technical stack of this application?',
    'Who is the CEO of OpenAI?',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h2 className="text-2xl font-semibold">VectorSage</h2>
      <p className="text-muted-foreground">
        Your retrieval-augmented generation assistant
      </p>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
