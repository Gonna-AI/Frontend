import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Top of page on route change; with a #hash, wait for the lazy page to render that element and scroll to it. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }

    let frame = 0;
    const started = performance.now();
    const seek = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
      if (performance.now() - started < 4000) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
