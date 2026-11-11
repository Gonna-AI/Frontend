/**
 * Colours the browser draws around the page (the status bar and top bar on phones) are taken from the
 * page. Each route says which colour that is, so the bar and the page read as one surface.
 */
const SITE = '#f4f4f4'; // the page canvas behind the rounded panels
const DARK_HERO = '#0d0d0e'; // pages that open on a dark full-bleed hero
const APP = '#0a0a0a'; // sign-in and workspace

const WORKSPACE = /^\/(dashboard|auth|login|invite|client|mail|chat|ai-settings)(\/|$)/;

export function chromeColorFor(pathname: string): string {
  if (WORKSPACE.test(pathname)) return APP;
  if (pathname === '/hive') return DARK_HERO;
  return SITE;
}

/** Applies the colour to the theme-color tag (Android, older iOS) and to the top edge strip (newer iOS). */
export function applyChromeColor(pathname: string) {
  const color = chromeColorFor(pathname);
  document.documentElement.style.setProperty('--ct-top-color', color);
  let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'theme-color';
    document.head.appendChild(tag);
  }
  tag.content = color;
}
