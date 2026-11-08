/**
 * Route-chunk fallback. Deliberately empty: the page canvas colour is already
 * painted by the critical style in index.html, so a first visit goes straight
 * from a calm blank canvas to the page fading in (no spinner, no dark flash).
 */
export default function LoadingScreen() {
  return <div aria-busy="true" style={{ minHeight: '100vh' }} />;
}
