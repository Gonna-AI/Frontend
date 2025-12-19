export const scrollToTop = () => {
    if ('scrollBehavior' in document.documentElement.style) {
      // Smooth scroll for browsers that support it (mainly desktop)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Instant scroll for browsers that don't support smooth scrolling (mainly mobile)
      window.scrollTo(0, 0);
    }
  };
  