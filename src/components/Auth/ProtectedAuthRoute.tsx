import type { ReactNode } from 'react';

import { AuthProvider } from '../../contexts/AuthContext';
import { PrivateRoute } from './PrivateRoute';

export default function ProtectedAuthRoute({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PrivateRoute>{children}</PrivateRoute>
    </AuthProvider>
  );
}
