'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn('flex items-start', {
        'justify-end': isUser,
      })}
      {...props}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src="/assistant.png" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'ml-4 flex-1 p-3 rounded-lg',
          {
            'bg-primary text-primary-foreground': isUser,
            'bg-muted': !isUser,
          }
        )}
      >
        <p>{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 ml-4">
          <AvatarImage src="/user.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
