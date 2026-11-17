import { useEffect, useState } from 'react';

/**
 * phone   up to 699 px      bottom bar, one column
 * tablet  700 to 1023 px    top bar and a drawer for navigation (iPad portrait, small Android tablets, foldables)
 * desktop 1024 px and up    persistent sidebar (iPad landscape, laptops)
 *
 * Widths are CSS pixels, so a Pro Max phone (440) and a mini iPad (744) land where they should, and a
 * phone turned sideways (up to ~932) becomes a tablet with a drawer instead of a cramped bottom bar.
 */
export type Layout = 'phone' | 'tablet' | 'desktop';

const PHONE = '(max-width: 699px)';
const DESKTOP = '(min-width: 1024px)';

function read(): Layout {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  if (window.matchMedia(PHONE).matches) return 'phone';
  return window.matchMedia(DESKTOP).matches ? 'desktop' : 'tablet';
}

export function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(read);
  useEffect(() => {
    const a = window.matchMedia(PHONE);
    const b = window.matchMedia(DESKTOP);
    const on = () => setLayout(read());
    a.addEventListener('change', on);
    b.addEventListener('change', on);
    on();
    return () => {
      a.removeEventListener('change', on);
      b.removeEventListener('change', on);
    };
  }, []);
  return layout;
}
