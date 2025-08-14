'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Message } from 'next/chat';
import type { Citation } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  console.log('Rendering chat message:', message);
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
      <div className="ml-4">
        <p className="font-semibold">
          {message.role === 'user' ? 'You' : 'Assistant'}
        </p>
        <p>{message.content}</p>
      </div>
    </div>
  );
}
