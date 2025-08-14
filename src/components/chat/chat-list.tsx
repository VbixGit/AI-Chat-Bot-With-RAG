'use client';

import { type Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { Separator } from '@/components/ui/separator';

interface ChatListProps {
  messages: Message[];
}

export function ChatList({ messages }: ChatListProps) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-8">
      {messages.map((message, index) => (
        <div key={index} className="pb-4">
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
}
