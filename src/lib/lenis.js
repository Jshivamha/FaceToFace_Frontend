// src/lib/lenis.js
import Lenis from '@studio-freight/lenis';

export const createLenis = () => {
  const lenis = new Lenis({
    duration: 3,
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
};
