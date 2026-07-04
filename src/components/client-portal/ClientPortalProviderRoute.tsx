import type { ReactNode } from 'react';

import { ClientPortalProvider } from '../../contexts/ClientPortalContext';

export default function ClientPortalProviderRoute({ children }: { children: ReactNode }) {
  return <ClientPortalProvider>{children}</ClientPortalProvider>;
}
