"use client";

import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isNowMobile = window.innerWidth < 768;
      console.log('Mobile check: Is mobile?', isNowMobile);
      setIsMobile(isNowMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};
