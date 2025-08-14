'use client';

import { Button } from '@/components/ui/button';
import { IconTrash } from '@/components/ui/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatHeaderProps {
  clearChat: () => void;
  isLoading: boolean;
}

export function ChatHeader({ clearChat, isLoading }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-xl font-semibold">VectorSage</h1>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={clearChat}
              disabled={isLoading}
            >
              <IconTrash />
              <span className="sr-only">Clear Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Chat</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  );
}
