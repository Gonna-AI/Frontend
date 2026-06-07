import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { clientPortalSupabase } from '../config/clientPortalSupabase';
import { buildPortalEmail, normalizePortalUsername } from '../utils/clientPortal';
import type { ClientAccount, ClientPortalDirectoryEntry, ClientPortalProfile } from '../types/clientPortal';

interface ClientPortalContextValue {
    session: Session | null;
    user: User | null;
    profile: ClientPortalProfile | null;
    account: ClientPortalProfile['client_accounts'] | null;
    loading: boolean;
    refreshProfile: () => Promise<ClientPortalProfile | null>;
    lookupUsername: (username: string) => Promise<ClientPortalDirectoryEntry | null>;
    signInWithUsername: (username: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const ClientPortalContext = createContext<ClientPortalContextValue | undefined>(undefined);

type ClientAccountRelation = ClientAccount | ClientAccount[] | null;
type RawClientPortalProfile = Omit<ClientPortalProfile, 'client_accounts'> & {
    client_accounts: ClientAccountRelation;
};
type RawClientPortalDirectoryEntry = Omit<ClientPortalDirectoryEntry, 'client_accounts'> & {
    client_accounts: ClientAccountRelation;
};

function normalizeAccountRelation(account: ClientAccount | ClientAccount[] | null | undefined) {
    if (Array.isArray(account)) {
        return account[0] ?? null;
    }

    return account ?? null;
}

async function fetchPortalProfile(userId: string) {
    const { data, error } = await clientPortalSupabase
        .from('client_portal_users')
        .select(`
            id,
            client_id,
            username,
            display_name,
            role,
            is_active,
            last_login_at,
            client_accounts (
                id,
                slug,
                name,
                logo_url,
                accent_color,
                surface_color,
                summary,
                support_email,
                calendly_url,
                slack_channel_id,
                notion_page_id,
                clickup_list_id
            )
        `)
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    const rawProfile = data as unknown as RawClientPortalProfile;

    return {
        ...rawProfile,
        client_accounts: normalizeAccountRelation(rawProfile.client_accounts),
    } satisfies ClientPortalProfile;
}

export function ClientPortalProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ClientPortalProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        const currentUser = user ?? session?.user ?? null;

        if (!currentUser) {
            setProfile(null);
            return null;
        }

        try {
            const nextProfile = await fetchPortalProfile(currentUser.id);
            setProfile(nextProfile);
            return nextProfile;
        } catch (error) {
            console.error('Failed to load client portal profile', error);
            setProfile(null);
            return null;
        }
    };

    useEffect(() => {
        let mounted = true;

        clientPortalSupabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) {
                return;
            }

            setSession(data.session);
            setUser(data.session?.user ?? null);

            if (data.session?.user) {
                try {
                    const nextProfile = await fetchPortalProfile(data.session.user.id);
                    if (mounted) {
                        setProfile(nextProfile);
                    }
                } catch (error) {
                    console.error('Failed to bootstrap client portal session', error);
                    if (mounted) {
                        setProfile(null);
                    }
                }
            }

            if (mounted) {
                setLoading(false);
            }
        }).catch((error) => {
            console.error('Client portal auth bootstrap failed', error);
            if (mounted) {
                setLoading(false);
            }
        });

        const { data: { subscription } } = clientPortalSupabase.auth.onAuthStateChange(async (_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);

            if (!nextSession?.user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                const nextProfile = await fetchPortalProfile(nextSession.user.id);
                setProfile(nextProfile);
            } catch (error) {
                console.error('Failed to refresh client portal session', error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const lookupUsername = async (username: string) => {
        const normalizedUsername = normalizePortalUsername(username);

        const { data, error } = await clientPortalSupabase
            .from('client_portal_directory')
            .select(`
                username,
                client_id,
                welcome_label,
                is_active,
                client_accounts (
                    id,
                    slug,
                    name,
                    logo_url,
                    accent_color,
                    surface_color,
                    summary,
                    support_email
                )
            `)
            .eq('username', normalizedUsername)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return null;
        }

        const rawDirectoryEntry = data as unknown as RawClientPortalDirectoryEntry;

        return {
            ...rawDirectoryEntry,
            client_accounts: normalizeAccountRelation(rawDirectoryEntry.client_accounts),
        } satisfies ClientPortalDirectoryEntry;
    };

    const signInWithUsername = async (username: string, password: string) => {
        const normalizedUsername = normalizePortalUsername(username);

        const { error } = await clientPortalSupabase.auth.signInWithPassword({
            email: buildPortalEmail(normalizedUsername),
            password,
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return { error: 'Incorrect password for this client portal.' };
            }

            return { error: error.message };
        }

        const sessionResult = await clientPortalSupabase.auth.getSession();
        const currentUser = sessionResult.data.session?.user ?? null;

        if (currentUser) {
            await clientPortalSupabase
                .from('client_portal_users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', currentUser.id);
        }

        return { error: null };
    };

    const signOut = async () => {
        await clientPortalSupabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    return (
        <ClientPortalContext.Provider
            value={{
                session,
                user,
                profile,
                account: profile?.client_accounts ?? null,
                loading,
                refreshProfile,
                lookupUsername,
                signInWithUsername,
                signOut,
            }}
        >
            {children}
        </ClientPortalContext.Provider>
    );
}

export function useClientPortal() {
    const context = useContext(ClientPortalContext);

    if (!context) {
        throw new Error('useClientPortal must be used within ClientPortalProvider');
    }

    return context;
}
