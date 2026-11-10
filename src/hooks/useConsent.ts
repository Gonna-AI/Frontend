import { useEffect, useState } from 'react';
import { hasConsent, onConsentChange, type ConsentCategory } from '../lib/consent';

/** Live view of one consent category; re-renders when the visitor changes their choice. */
export function useConsent(category: ConsentCategory): boolean {
  const [granted, setGranted] = useState(() => hasConsent(category));

  useEffect(() => {
    setGranted(hasConsent(category));
    return onConsentChange((record) => setGranted(record[category]));
  }, [category]);

  return granted;
}
