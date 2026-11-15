import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import HiveDashboard from './HiveDashboard';

/**
 * Public route: the dashboard opens without signing in and shows placeholder data only.
 * A signed-in visitor sees their own name; everyone else is a guest. Nothing private is
 * loaded here, so when real endpoints arrive they must send the session and enforce access
 * on the server, not in this page.
 */
function Inner() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const signedIn = Boolean(user);
  const name = (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email?.split('@')[0] || 'Guest';

  return (
    <>
      <Helmet>
        <title>Hive dashboard · ClerkTree</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <HiveDashboard
        guest={!signedIn}
        user={{
          name,
          email: user?.email ?? 'Demo preview',
          avatarUrl: (user?.user_metadata?.avatar_url as string | undefined) || undefined,
        }}
        onSignOut={() => {
          if (!signedIn) navigate('/login');
          else void signOut().then(() => navigate('/login'));
        }}
      />
    </>
  );
}

export default function HiveDashboardRoute() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
