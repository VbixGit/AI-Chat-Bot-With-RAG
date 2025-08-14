'use client';

import { useChat, type Message } from 'ai/react';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { ChatList } from '@/components/chat/chat-list';
import { ChatScrollAnchor } from '@/components/chat/chat-scroll-anchor';
import { PromptForm } from '@/components/chat/chat-prompt-form';
import { askQuestion } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import type { Citation } from '@/lib/types';

export function ChatPanel() {
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: '/api/chat', // Dummy endpoint, not used
      async onFinish(message: Message) {
        console.log('Chat finished, final message:', message);
      },
      async onResponse(response) {
        console.log('Chat response received:', response);
      },
      onError(error) {
        console.error('Chat error:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  const { formRef, onKeyDown } = useEnterSubmit();

  const handleAskQuestion = async (question: string) => {
    console.log('Asking question:', question);
    const userMessage: Message = {
      id: 'user-message',
      role: 'user',
      content: question,
    };
    append(userMessage);

    const res = await askQuestion(question);

    if ('error' in res) {
      const errorMessage: Message = {
        id: 'error-message',
        role: 'assistant',
        content: res.error,
      };
      append(errorMessage);
      return;
    }

    const aiMessage: Message = {
      id: 'ai-message',
      role: 'assistant',
      content: res.answer,
    };
    append(aiMessage);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ChatList messages={messages} />
        <ChatScrollAnchor trackVisibility={isLoading} />
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
