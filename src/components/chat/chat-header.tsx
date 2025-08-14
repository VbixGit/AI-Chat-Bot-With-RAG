'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type ChatHeaderProps = {
  clearChat: () => void;
  isLoading: boolean;
};

export function ChatHeader({ clearChat, isLoading }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-bold font-headline">VectorSage</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={clearChat}
        disabled={isLoading}
        aria-label="Clear chat history"
      >
        <Trash2 className="size-5" />
      </Button>
    </header>
  );
}
