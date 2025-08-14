'use client';

import { useRef } from 'react';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { IconArrowElbow, IconStop } from '@/components/ui/icons';

interface PromptFormProps {
  formRef: React.RefObject<HTMLFormElement>;
  onSubmit: (value: string) => Promise<void>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
}

export function PromptForm({
  formRef,
  onSubmit,
  onKeyDown,
  input,
  setInput,
  isLoading,
}: PromptFormProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      ref={formRef}
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput('');
        await onSubmit(input);
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="w-full resize-none bg-transparent py-4 focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={() => {
                // This is a dummy function for now, as we don't have a way to stop the AI's response
              }}
            >
              <IconStop />
              <span className="sr-only">Stop</span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input === ''}
            >
              <IconArrowElbow />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
