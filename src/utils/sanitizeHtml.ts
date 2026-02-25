const BLOCKED_PROTOCOLS = /^(?:javascript|data|vbscript):/i;
const SAFE_LINK_PROTOCOLS = /^(?:https?:|mailto:|tel:|\/|#)/i;

/**
 * Sanitizes trusted static HTML before injecting it into the DOM.
 * This strips executable content and hardens external links.
 */
export function sanitizeTrustedHtml(rawHtml: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return rawHtml;
  }

  try {
    const documentFragment = new DOMParser().parseFromString(rawHtml, 'text/html');

    // Remove active content containers entirely.
    const blockedTags = ['script', 'iframe', 'object', 'embed', 'form', 'meta', 'base'];
    blockedTags.forEach((tagName) => {
      documentFragment.querySelectorAll(tagName).forEach((element) => element.remove());
    });

    documentFragment.querySelectorAll<HTMLElement>('*').forEach((element) => {
      const attributes = Array.from(element.attributes);

      for (const attribute of attributes) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim();

        if (name.startsWith('on')) {
          element.removeAttribute(attribute.name);
          continue;
        }

        if ((name === 'href' || name === 'src' || name === 'xlink:href') && BLOCKED_PROTOCOLS.test(value)) {
          element.removeAttribute(attribute.name);
        }
      }

      if (element.tagName.toLowerCase() !== 'a') {
        return;
      }

      const anchor = element as HTMLAnchorElement;
      const href = anchor.getAttribute('href')?.trim() ?? '';

      if (href && !SAFE_LINK_PROTOCOLS.test(href)) {
        anchor.removeAttribute('href');
      }

      if (anchor.getAttribute('target') === '_blank') {
        const relValues = new Set(
          (anchor.getAttribute('rel') ?? '')
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean),
        );

        relValues.add('noopener');
        relValues.add('noreferrer');
        anchor.setAttribute('rel', Array.from(relValues).join(' '));
      }
    });

    return documentFragment.body.innerHTML;
  } catch {
    return rawHtml;
  }
}

