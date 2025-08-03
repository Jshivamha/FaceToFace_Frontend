import { useEffect } from 'react';
import { createLenis } from '../lib/lenis';

export const useLenis = () => {
  useEffect(() => {
    const lenis = createLenis();
    return () => {
      // Lenis currently doesn't expose a destroy API, but if/when it does:
      // lenis.destroy?.();
      document.body.style.overflow = '';
    };
  }, []);
};
