'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface ChatScrollAnchorProps {
  trackVisibility: boolean;
}

export function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const { ref, inView, entry } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: '0px 0px -50px 0px',
  });

  useEffect(() => {
    if (trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start',
      });
    }
  }, [inView, entry, trackVisibility]);

  return <div ref={ref} className="h-px w-full" />;
}
