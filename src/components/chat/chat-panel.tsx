'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import type { Message, ServerActionResponse } from '@/lib/types';
import { cn } from '@/lib/utils';
import { askQuestion } from '@/app/actions';

import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { useToast } from '@/hooks/use-toast';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Send } from 'lucide-react';

import { ChatHeader } from './chat-header';
import { ChatMessage, LoadingMessage } from './chat-message';
import { ChatEmptyState } from './chat-empty-state';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { formRef, onKeyDown } = useEnterSubmit();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: values.message,
    };

    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: <LoadingMessage />,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    form.reset();

    startTransition(async () => {
      const result: ServerActionResponse = await askQuestion(values.message);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setMessages((prev) => prev.filter(msg => msg.id !== assistantMessageId));
        return;
      }
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: result.answer, citations: result.citations }
            : msg
        )
      );
    });
  };

  const clearChat = () => {
    setMessages([]);
  };

  const setQuery = (query: string) => {
    form.setValue('message', query);
  }

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg m-2">
      <ChatHeader clearChat={clearChat} isLoading={isPending} />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {messages.length > 0 ? (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            ) : (
              <ChatEmptyState setQuery={setQuery}/>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start gap-4"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ask a question..."
                      rows={1}
                      onKeyDown={onKeyDown}
                      className="resize-none max-h-36"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isPending}>
              <Send className="size-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
