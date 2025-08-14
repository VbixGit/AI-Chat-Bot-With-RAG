'use client';

import * as React from 'react';

export function IconTrash(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 4.5H12.5" />
      <path d="M4.5 4.5V12.5C4.5 13.0523 4.94772 13.5 5.5 13.5H10.5C11.0523 13.5 11.5 13.0523 11.5 12.5V4.5" />
      <path d="M6.5 4.5V3.5C6.5 2.94772 6.94772 2.5 7.5 2.5H8.5C9.05228 2.5 9.5 2.94772 9.5 3.5V4.5" />
    </svg>
  );
}

export function IconArrowElbow(props: React.SVGProps<SVGSVGElement>) {
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

export function IconCheck(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M13.5 4.5L6.5 11.5L2.5 7.5" />
    </svg>
  );
}

export function IconCopy(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
      <path d="M3.5 10.5V3.5C3.5 2.94772 3.94772 2.5 4.5 2.5H10.5" />
    </svg>
  );
}

export function IconStop(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
    </svg>
  );
}
