import { useState, useEffect, useCallback } from 'react';
import { createNotification } from '../../services/notificationService';
import {
  User, Building2, Phone as PhoneIcon, Globe, Shield, Download, Trash2,
  Loader2, Save, Check, AlertCircle, Bell, Mail, Smartphone, ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  privacy_profile_public: boolean;
  privacy_data_analytics: boolean;
  team_auto_add_members: boolean;
  api_rate_limit_alerts: boolean;
  call_recording_default: boolean;
  call_transcription_enabled: boolean;
}

interface SettingsViewProps {
  isDark: boolean;
}

interface ProfileData {
  display_name: string;
  company_name: string;
  phone: string;
  timezone: string;
  email: string;
  avatar_url: string;
  credits_balance: number;
  created_at: string;
  last_sign_in: string;
}

interface NotifPrefs {
  email_low_credits: boolean;
  email_payment: boolean;
  email_team: boolean;
  email_weekly_report: boolean;
  push_calls: boolean;
  push_security: boolean;
  push_billing: boolean;
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo',
  'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland',
];

type SettingsTab = 'profile' | 'notifications' | 'security' | 'data';

export default function SettingsView({ isDark }: SettingsViewProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '', company_name: '', phone: '', timezone: 'UTC',
    email: '', avatar_url: '', credits_balance: 50, created_at: '', last_sign_in: '',
  });
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    email_low_credits: true, email_payment: true, email_team: true,
    email_weekly_report: false, push_calls: true, push_security: true, push_billing: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const settingsBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-settings`;

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const apiCall = useCallback(async (path: string, options?: RequestInit) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error('No session');
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-settings/${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`);
    return data;
  }, []);

  const notifApiCall = useCallback(async (path: string, options?: RequestInit) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error('No session');
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-notifications/${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`);
    return data;
  }, []);

  // Load user settings from endpoint
  const loadUserSettings = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(settingsBase, { headers });
      const result = await res.json();
      if (res.ok && result.settings) {
        setUserSettings(result.settings);
      }
    } catch (err) {
      console.error('[SettingsView] Failed to load user settings:', err);
    }
  }, [getAuthHeaders]);

  // Save user settings to endpoint
  const persistUserSettings = useCallback(async (settings: UserSettings) => {
    try {
      setSavingSettings(true);
      const headers = await getAuthHeaders();
      const res = await fetch(settingsBase, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        console.error('[SettingsView] Failed to save settings');
      }
    } catch (err) {
      console.error('[SettingsView] Failed to persist settings:', err);
    } finally {
      setSavingSettings(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [profileRes, prefsRes] = await Promise.all([
          apiCall('profile'),
          notifApiCall('preferences'),
        ]);
        if (profileRes.profile) setProfile(profileRes.profile);
        if (prefsRes.preferences) setNotifPrefs(prefsRes.preferences);

        // Load user settings from Supabase
        await loadUserSettings();
      } catch (err) {
        console.error('[SettingsView] load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiCall, notifApiCall, loadUserSettings]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await apiCall('profile', {
        method: 'PUT',
        body: JSON.stringify({
          display_name: profile.display_name,
          company_name: profile.company_name,
          phone: profile.phone,
          timezone: profile.timezone,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void createNotification({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile changes have been saved.',
        category: 'system',
        action_url: '/dashboard?tab=settings',
      });
    } catch (err) {
      console.error('[SettingsView] save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const saveNotifPrefs = async (updated: NotifPrefs) => {
    setNotifPrefs(updated);
    try {
      await notifApiCall('preferences', { method: 'PUT', body: JSON.stringify(updated) });
    } catch (err) {
      console.error('[SettingsView] notif prefs error:', err);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await apiCall('export');
      if (!data?.export) throw new Error('Export data missing');
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clerktree-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      void createNotification({
        type: 'success',
        title: 'Data export ready',
        message: 'Your account data has been downloaded.',
        category: 'system',
      });
    } catch (err) {
      console.error('[SettingsView] export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiCall('account', { method: 'DELETE' });
      setDeleteConfirm(false);
      void createNotification({
        type: 'warning',
        title: 'Account deletion scheduled',
        message: 'Your account will be deleted. Check your email for confirmation.',
        category: 'security',
      });
      alert('Account deletion has been scheduled. You will receive a confirmation email.');
    } catch (err) {
      console.error('[SettingsView] delete error:', err);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('settings.profile') || 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: t('settings.notifications') || 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: t('settings.security') || 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: t('settings.data') || 'Data & Privacy', icon: <Download className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8A5B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
          {t('settings.title') || 'Settings'}
        </h2>
        <p className={cn("text-sm mt-1", isDark ? "text-white/50" : "text-gray-500")}>
          {t('settings.subtitle') || 'Manage your account, notifications, and privacy'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={cn("flex gap-1 p-1 rounded-xl border overflow-x-auto scrollbar-hide w-full sm:w-fit", isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0",
              activeTab === tab.id
                ? isDark ? "bg-[#FF8A5B]/15 text-[#FFB286]" : "bg-[#FF8A5B]/10 text-[#FF6B35] shadow-sm"
                : isDark ? "text-white/50 hover:text-white/80" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={cn("p-6 rounded-2xl border space-y-6", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          {/* Avatar & Email */}
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full ring-2 ring-purple-500/20" />
            ) : (
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold", isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700")}>
                {(profile.display_name || profile.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{profile.email}</p>
              <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-white/70" : "text-gray-600")}>
                <User className="w-3.5 h-3.5 inline mr-1.5" />Display Name
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                  isDark ? "bg-white/5 border-white/10 text-white focus:border-[#FF8A5B]/50" : "bg-white border-gray-200 text-gray-900 focus:border-[#FF8A5B]"
                )}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-white/70" : "text-gray-600")}>
                <Building2 className="w-3.5 h-3.5 inline mr-1.5" />Company Name
              </label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile(p => ({ ...p, company_name: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                  isDark ? "bg-white/5 border-white/10 text-white focus:border-[#FF8A5B]/50" : "bg-white border-gray-200 text-gray-900 focus:border-[#FF8A5B]"
                )}
                placeholder="Company name"
              />
            </div>
            <div>
              <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-white/70" : "text-gray-600")}>
                <PhoneIcon className="w-3.5 h-3.5 inline mr-1.5" />Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                  isDark ? "bg-white/5 border-white/10 text-white focus:border-[#FF8A5B]/50" : "bg-white border-gray-200 text-gray-900 focus:border-[#FF8A5B]"
                )}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-white/70" : "text-gray-600")}>
                <Globe className="w-3.5 h-3.5 inline mr-1.5" />Timezone
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile(p => ({ ...p, timezone: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                  isDark ? "bg-white/5 border-white/10 text-white focus:border-[#FF8A5B]/50" : "bg-white border-gray-200 text-gray-900 focus:border-[#FF8A5B]"
                )}
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                saved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#FF8A5B] hover:bg-[#FF9E6C] text-white shadow-lg shadow-[#FF8A5B]/20"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className={cn("p-6 rounded-2xl border space-y-6", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          {/* Email Notifications */}
          <div>
            <h3 className={cn("text-sm font-semibold mb-3 flex items-center gap-2", isDark ? "text-white/80" : "text-gray-700")}>
              <Mail className="w-4 h-4" /> Email Notifications
            </h3>
            <div className="space-y-3">
              {[
                { key: 'email_low_credits' as keyof NotifPrefs, label: 'Low credit balance alerts', desc: 'Get notified when credits drop below 10%' },
                { key: 'email_payment' as keyof NotifPrefs, label: 'Payment confirmations', desc: 'Receipts for successful payments' },
                { key: 'email_team' as keyof NotifPrefs, label: 'Team activity', desc: 'When team members join or are removed' },
                { key: 'email_weekly_report' as keyof NotifPrefs, label: 'Weekly analytics report', desc: 'Summary of call metrics every Monday' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>{label}</p>
                    <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>{desc}</p>
                  </div>
                  <button
                    onClick={() => saveNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] })}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      notifPrefs[key] ? "bg-[#FF8A5B]" : isDark ? "bg-white/10" : "bg-gray-200"
                    )}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", notifPrefs[key] ? "left-5" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h3 className={cn("text-sm font-semibold mb-3 flex items-center gap-2", isDark ? "text-white/80" : "text-gray-700")}>
              <Smartphone className="w-4 h-4" /> In-App Notifications
            </h3>
            <div className="space-y-3">
              {[
                { key: 'push_calls' as keyof NotifPrefs, label: 'Call alerts', desc: 'High-priority or critical calls' },
                { key: 'push_security' as keyof NotifPrefs, label: 'Security alerts', desc: 'Login attempts and API key changes' },
                { key: 'push_billing' as keyof NotifPrefs, label: 'Billing updates', desc: 'Payment status and credit changes' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>{label}</p>
                    <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>{desc}</p>
                  </div>
                  <button
                    onClick={() => saveNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] })}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      notifPrefs[key] ? "bg-[#FF8A5B]" : isDark ? "bg-white/10" : "bg-gray-200"
                    )}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", notifPrefs[key] ? "left-5" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className={cn("p-6 rounded-2xl border space-y-6", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <div>
            <h3 className={cn("text-sm font-semibold mb-1", isDark ? "text-white/80" : "text-gray-700")}>Authentication</h3>
            <p className={cn("text-xs mb-4", isDark ? "text-white/40" : "text-gray-400")}>
              Your account is secured via {user?.app_metadata?.provider || 'email'} authentication.
            </p>
          </div>

          <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>OAuth Provider</p>
                  <p className={cn("text-xs capitalize", isDark ? "text-white/40" : "text-gray-400")}>
                    {user?.app_metadata?.provider || 'Email/Password'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                <Check className="w-3 h-3" /> Active
              </div>
            </div>
          </div>

          <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200")}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>Last Sign In</p>
                <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>
                  {profile.last_sign_in ? new Date(profile.last_sign_in).toLocaleString() : 'Unknown'}
                </p>
              </div>
              <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
            </div>
          </div>

          <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200")}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>Account Created</p>
                <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-400")}>
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
            </div>
          </div>
        </div>
      )}

      {/* Data & Privacy Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* Export Data */}
          <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Export Your Data</h3>
                <p className={cn("text-xs mt-0.5", isDark ? "text-white/40" : "text-gray-400")}>
                  Download all your data including call history, team members, API keys, and payment records as JSON.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className={cn(
                  "shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                  isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                )}
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className={cn("p-6 rounded-2xl border border-red-500/20", isDark ? "bg-red-500/[0.03]" : "bg-red-50/50")}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className={cn("text-sm font-semibold text-red-500")}>Delete Account</h3>
                <p className={cn("text-xs mt-0.5 mb-4", isDark ? "text-white/40" : "text-gray-500")}>
                  Permanently delete your account and all associated data. This action cannot be undone. Your data will be removed within 30 days.
                </p>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Confirm Deletion
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors", isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-700")}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
