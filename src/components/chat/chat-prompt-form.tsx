'use client';

import { useRef } from 'react';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { IconArrowElbow } from '@/components/ui/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PromptFormProps {
  formRef: React.RefObject<HTMLFormElement>;
  onSubmit: (value: string) => Promise<void>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  modelProvider: 'openai' | 'cohere';
  setModelProvider: (value: 'openai' | 'cohere') => void;
}

export function PromptForm({
  formRef,
  onSubmit,
  onKeyDown,
  input,
  setInput,
  isLoading,
  modelProvider,
  setModelProvider,
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
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-4 sm:rounded-full sm:border items-center flex-row">
        <Select
            value={modelProvider}
            onValueChange={(value: 'openai' | 'cohere') => setModelProvider(value)}
            disabled={isLoading}
        >
            <SelectTrigger className="w-[120px] border-none focus:ring-0">
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
            </SelectContent>
        </Select>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="w-full resize-none bg-transparent py-4 pl-4 pr-12 focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-4 top-3">
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || input === ''}
            className="rounded-full shadow-lg"
          >
            <IconArrowElbow />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
