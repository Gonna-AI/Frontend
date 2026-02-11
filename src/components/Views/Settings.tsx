import React, { useState } from 'react';
import {
  Bell, Lock, Settings as SettingsIcon, User,
  FileText, Users, Database, Boxes, HelpCircle, MessageSquare, Check
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_BASE_URL } from '../../config/api';
import { Switch } from '../ui/Switch';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import ReauthModal from '../ReauthModal';

export default function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);
  const [updateButtonOutline, setUpdateButtonOutline] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false
  });
  const [apiTokens, setApiTokens] = useState([
    { name: 'Production API Key', token: 'pk_live_**********************', created: '2024-01-15' },
    { name: 'Development API Key', token: 'pk_test_**********************', created: '2024-02-01' }
  ]);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/api/auth/user');
      const userData = response.data;
      setName(userData.name);
      setEmail(userData.email);
      setProfilePicture(userData.profile_picture);
      return userData;
    },
  });

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data: { name?: string, email?: string, profile_picture?: string }) => {
      return api.put('/api/auth/user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
      setIsUpdateDisabled(false);
      setUpdateButtonOutline('outline outline-emerald-500');
    }
  };

  const { updateUser } = useAuth();
  const [reauthOpen, setReauthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const handleSecurityAction = (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setReauthOpen(true);
  };

  const handleReauthSuccess = async () => {
    setReauthOpen(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match");
      return;
    }
    const { error } = await updateUser({ password: newPassword });
    if (error) setSecurityError(error.message);
    else {
      setSecuritySuccess("Password updated successfully");
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const updateEmailAddress = async () => {
    const { error } = await updateUser({ email: newEmail });
    if (error) setSecurityError(error.message);
    else {
      setSecuritySuccess("Confirmation link sent to new email address");
      setNewEmail('');
    }
  };

  const handleUpdatePicture = async () => {
    if (!isUpdateDisabled) {
      const formData = new FormData();
      const blob = await fetch(profilePicture!).then(r => r.blob());
      formData.append('profile_picture', blob);
      updateUserMutation.mutate({ profile_picture: formData.get('profile_picture') as string });
      setIsUpdateDisabled(true);
      setUpdateButtonOutline('');
      refetch();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const sidebarItems = [
    { icon: FileText, label: 'General', id: 'general' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Lock, label: 'Security', id: 'security' },
    { icon: Database, label: 'API Tokens', id: 'api' }
  ];

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "rounded-3xl border shadow-lg",
      isDark
        ? "bg-black/20 border-white/10 backdrop-blur-xl"
        : "bg-white/10 border-black/10 backdrop-blur-xl",
      className
    )}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-6 max-w-[95rem] mx-auto">
        <GlassContainer className="min-h-[85vh] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className={cn(
              "sticky top-0 md:w-24 border-r h-full",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              <div className="flex md:flex-col h-full p-4 gap-3 items-center">
                {/* Settings Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-6 hidden md:flex",
                  isDark
                    ? "bg-black/20 border border-white/10"
                    : "bg-white/10 border border-black/10"
                )}>
                  <SettingsIcon className={cn(
                    "w-6 h-6",
                    isDark ? "text-white/70" : "text-black/70"
                  )} />
                </div>

                {/* Navigation Icons */}
                <div className="flex md:flex-col w-full gap-3">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all w-full",
                        "group outline-none",
                        activeTab === item.id
                          ? isDark
                            ? "bg-black/20 border border-white/10"
                            : "bg-white/10 border border-black/10"
                          : isDark
                            ? "hover:bg-black/20 hover:border hover:border-white/10"
                            : "hover:bg-white/10 hover:border hover:border-black/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        activeTab === item.id
                          ? isDark
                            ? "bg-black/20"
                            : "bg-white/10"
                          : "bg-transparent"
                      )}>
                        <item.icon className={cn(
                          "w-5 h-5",
                          activeTab === item.id
                            ? isDark
                              ? "text-white"
                              : "text-black"
                            : isDark
                              ? "text-white/60"
                              : "text-black/60"
                        )} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>General Settings</h2>

                  <div className="space-y-6">

                    <GlassContainer className="p-8 space-y-6">
                      <div>
                        <h3 className={cn(
                          "text-2xl font-medium mb-6",
                          isDark ? "text-white" : "text-black"
                        )}>Profile Information</h3>
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <label className={cn(
                              "block text-base font-medium mb-3",
                              isDark ? "text-white/60" : "text-black/60"
                            )}>Name</label>
                            <p className={cn(
                              "text-lg break-words",
                              isDark ? "text-white/90" : "text-black/90"
                            )}>{name}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <label className={cn(
                              "block text-base font-medium mb-3",
                              isDark ? "text-white/60" : "text-black/60"
                            )}>Email</label>
                            <p className={cn(
                              "text-lg break-words",
                              isDark ? "text-white/90" : "text-black/90"
                            )}>{email}</p>
                          </div>
                        </div>
                      </div>
                    </GlassContainer>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>Security Settings</h2>

                  {/* Password Change */}
                  <GlassContainer className="p-6">
                    <h3 className={cn("text-lg font-medium mb-4", isDark ? "text-white" : "text-black")}>Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white/60" : "text-black/60")}>New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white/60" : "text-black/60")}>Confirm Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={() => handleSecurityAction(updatePassword)}
                        disabled={!newPassword || !confirmPassword}
                        className={cn(
                          "px-4 py-2 rounded-xl transition-colors",
                          isDark
                            ? "bg-white text-black hover:bg-gray-200 disabled:bg-white/50"
                            : "bg-black text-white hover:bg-gray-800 disabled:bg-black/50"
                        )}>
                        Update Password
                      </button>
                    </div>
                  </GlassContainer>

                  {/* Email Change */}
                  <GlassContainer className="p-6">
                    <h3 className={cn("text-lg font-medium mb-4", isDark ? "text-white" : "text-black")}>Change Email</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white/60" : "text-black/60")}>New Email Address</label>
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email"
                        />
                      </div>
                      <button
                        onClick={() => handleSecurityAction(updateEmailAddress)}
                        disabled={!newEmail}
                        className={cn(
                          "px-4 py-2 rounded-xl transition-colors",
                          isDark
                            ? "bg-white text-black hover:bg-gray-200 disabled:bg-white/50"
                            : "bg-black text-white hover:bg-gray-800 disabled:bg-black/50"
                        )}>
                        Update Email
                      </button>
                    </div>
                  </GlassContainer>

                  {/* Feedback Messages */}
                  {(securityError || securitySuccess) && (
                    <div className={cn(
                      "p-4 rounded-xl",
                      securityError ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {securityError || securitySuccess}
                    </div>
                  )}

                  {/* Two Factor (Existing) */}
                  <GlassContainer className="p-6">
                    <div className="space-y-6">
                      {!showTwoFactor ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "text-lg font-medium mb-1",
                              isDark ? "text-white" : "text-black"
                            )}>Two-Factor Authentication</h3>
                            <p className={cn(
                              "text-sm",
                              isDark ? "text-white/60" : "text-black/60"
                            )}>
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <button
                            onClick={() => setShowTwoFactor(true)}
                            className={cn(
                              "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto",
                              isDark
                                ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white"
                                : "bg-white/10 hover:bg-white/20 border border-black/10 text-black"
                            )}>
                            Configure
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              isDark ? "bg-emerald-500/20" : "bg-emerald-500/10"
                            )}>
                              <Check className={cn(
                                "w-5 h-5",
                                isDark ? "text-emerald-400" : "text-emerald-600"
                              )} />
                            </div>
                            <span className={cn(
                              "text-sm",
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            )}>
                              Two-factor authentication is enabled
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassContainer>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>Notification Preferences</h2>

                  <GlassContainer className="p-6 space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div>
                          <h3 className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white" : "text-black"
                          )}>{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</h3>
                          <p className={cn(
                            "text-sm",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>Receive {key} notifications about your account</p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setNotifications(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </GlassContainer>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className={cn(
                      "text-xl font-semibold",
                      isDark ? "text-white" : "text-black"
                    )}>API Tokens</h2>
                    <button className={cn(
                      "px-4 py-2 rounded-xl transition-colors",
                      isDark
                        ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white"
                        : "bg-white/10 hover:bg-white/20 border border-black/10 text-black"
                    )}>
                      Generate New Token
                    </button>
                  </div>

                  <GlassContainer className="p-6 space-y-4">
                    {apiTokens.map((token, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                        <div>
                          <h3 className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white" : "text-black"
                          )}>{token.name}</h3>
                          <p className={cn(
                            "text-sm font-mono",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>{token.token}</p>
                          <p className={cn(
                            "text-xs",
                            isDark ? "text-white/40" : "text-black/40"
                          )}>Created: {token.created}</p>
                        </div>
                        <button className={cn(
                          "px-4 py-2 rounded-xl transition-colors text-red-500",
                          isDark
                            ? "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                        )}>
                          Revoke
                        </button>
                      </div>
                    ))}
                  </GlassContainer>
                </div>
              )}

            </div>
          </div>
        </GlassContainer>
      </div>
      <ReauthModal
        isOpen={reauthOpen}
        onClose={() => setReauthOpen(false)}
        onSuccess={handleReauthSuccess}
        isDark={isDark}
      />
    </div>
  );
}