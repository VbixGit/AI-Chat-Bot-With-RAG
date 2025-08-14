'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@/components/ui/icons';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4 bg-gray-100 dark:bg-gray-800 border-r">
      <Button variant="outline" className="w-full justify-start">
        <IconPlus className="mr-2" />
        New Chat
      </Button>
      {/* Conversation history can be added here later */}
    </div>
  );
}
