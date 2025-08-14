'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { IconCheck, IconCopy } from '@/components/ui/icons';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    text: message.content,
  });

  return (
    <div className="flex items-start p-4" {...props}>
      <Avatar className="w-8 h-8">
        <AvatarImage
          src={message.role === 'user' ? '/user.png' : '/assistant.png'}
        />
        <AvatarFallback>
          {message.role === 'user' ? 'U' : 'A'}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard()}
                >
                  {isCopied ? <IconCheck /> : <IconCopy />}
                  <span className="sr-only">Copy message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p>{message.content}</p>
      </div>
    </div>
  );
}
