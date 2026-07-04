import type { ReactNode } from 'react';

import { ClientPortalProvider } from '../../contexts/ClientPortalContext';
import { ClientPortalRoute } from './ClientPortalRoute';

export default function ProtectedClientPortalRoute({ children }: { children: ReactNode }) {
  return (
    <ClientPortalProvider>
      <ClientPortalRoute>{children}</ClientPortalRoute>
    </ClientPortalProvider>
  );
}
