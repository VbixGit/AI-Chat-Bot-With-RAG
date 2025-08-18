'use client';

import { useState } from 'react';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { ChatList } from '@/components/chat/chat-list';
import { ChatScrollAnchor } from '@/components/chat/chat-scroll-anchor';
import { PromptForm } from '@/components/chat/chat-prompt-form';
import { askQuestion } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import type { Message } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatEmptyState } from './chat-empty-state';

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { formRef, onKeyDown } = useEnterSubmit();

  const handleAskQuestion = async (question: string) => {
    console.log(`Step 1 (Client): User submitted question: "${question}"`);
    setIsLoading(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    // Add a placeholder for the assistant's response to show loading
    const assistantPlaceholder: Message = {
      id: `ai-placeholder-${Date.now()}`,
      role: 'assistant',
      content: '...',
    };

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);

    const chatHistory = [...messages, userMessage];
    const res = await askQuestion(question, chatHistory);
    
    if ('error' in res) {
      toast({
        title: 'Error',
        description: res.error,
        variant: 'destructive',
      });
      // Replace placeholder with the error message
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const placeholderIndex = updatedMessages.findIndex(msg => msg.id.startsWith('ai-placeholder-'));
        if (placeholderIndex !== -1) {
          updatedMessages[placeholderIndex] = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: res.error,
          };
        }
        return updatedMessages;
      });
    } else {
      console.log('Step 10 (Client): Received response from server:', res);
      // Replace placeholder with the actual answer
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const placeholderIndex = updatedMessages.findIndex(msg => msg.id.startsWith('ai-placeholder-'));
        if (placeholderIndex !== -1) {
          updatedMessages[placeholderIndex] = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: res.answer,
          };
        }
        return updatedMessages;
      });
      console.log('Step 11 (Client): Displaying AI response');
    }

    setIsLoading(false);
  };

  const clearChat = () => {
    console.log('Client: Clearing chat');
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader clearChat={clearChat} isLoading={isLoading} />
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <ChatEmptyState onSuggestionClick={setInput} />
        )}
      </div>
      <div className="w-full px-4 py-2">
        <PromptForm
          formRef={formRef}
          onSubmit={async value => {
            await handleAskQuestion(value);
          }}
          onKeyDown={onKeyDown}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
