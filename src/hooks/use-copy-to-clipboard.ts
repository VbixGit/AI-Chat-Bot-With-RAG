'use client';

import { useState } from 'react';

export function useCopyToClipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return { isCopied, copyToClipboard };
}
