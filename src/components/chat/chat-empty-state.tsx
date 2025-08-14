'use client';

import { Button } from '@/components/ui/button';

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  const suggestions = [
    'What is the meaning of life?',
    'What is the best programming language?',
    'Who is the CEO of OpenAI?',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-2xl font-semibold">VectorSage</div>
      <div className="text-gray-500">
        Your retrieval-augmented generation assistant
      </div>
      <div className="flex space-x-2 mt-4">
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
