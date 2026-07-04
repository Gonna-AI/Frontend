import type { ReactNode } from 'react';

import { AuthProvider } from '../../contexts/AuthContext';

export default function AuthRouteProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
