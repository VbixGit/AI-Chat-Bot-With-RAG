'use client';

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChatMessage({ message }: { message: Message }) {
  const { role, content, citations } = message;
  const isAssistant = role === 'assistant';

  return (
    <div className={cn('flex items-start gap-4', isAssistant ? '' : 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>{isAssistant ? <Bot className="size-5" /> : <User className="size-5" />}</AvatarFallback>
      </Avatar>
      <div className={cn('flex flex-col gap-2 max-w-[80%]', isAssistant ? 'items-start' : 'items-end')}>
        <div className={cn('rounded-lg p-3 text-sm', isAssistant ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
          {typeof content === 'string' ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            content
          )}
        </div>
        {citations && citations.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">CITATIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {citations.map((citation) => (
                <a
                  key={citation.index}
                  href={citation.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="hover:bg-muted transition-colors">
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs font-medium truncate flex items-center justify-between">
                        <span className="truncate pr-2">{`[${citation.index}] ${citation.title}`}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingMessage() {
    return (
        <div className="flex items-center gap-2">
            <Loader2 className="animate-spin size-4" />
            <span>Thinking...</span>
        </div>
    )
}
