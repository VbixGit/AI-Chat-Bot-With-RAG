'use client';

import { type Message } from 'ai/react';
import { ChatMessage } from './chat-message';

interface ChatListProps {
  messages: Message[];
}

export function ChatList({ messages }: ChatListProps) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index} className="pb-4">
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
}
