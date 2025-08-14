'use client';

import * as React from 'react';

function IconArrowElbow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 3.5V9C13 10.933 11.433 12.5 9.5 12.5H3" />
      <path d="M6 9.5L3 12.5L6 15.5" />
    </svg>
  );
}

export { IconArrowElbow };
