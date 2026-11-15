import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import HiveDashboard from './HiveDashboard';

/** Route wrapper: reads the signed-in user and hands the pure dashboard what it needs. */
export default function HiveDashboardRoute() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const name =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email?.split('@')[0] || 'there';

  return (
    <HiveDashboard
      user={{
        name,
        email: user?.email ?? '',
        avatarUrl: (user?.user_metadata?.avatar_url as string | undefined) || undefined,
      }}
      onSignOut={() => {
        void signOut().then(() => navigate('/login'));
      }}
    />
  );
}
