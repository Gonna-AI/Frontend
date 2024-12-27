import React, { useState } from 'react';
import { Bell, Lock, Settings as SettingsIcon, User, 
  FileText, Users, Database, Boxes, HelpCircle, MessageSquare, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_BASE_URL } from '../../config/api';

export default function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);
  const [updateButtonOutline, setUpdateButtonOutline] = useState('');

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
      setIsSaveDisabled(true);
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsSaveDisabled(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsSaveDisabled(false);
  };

  const handleSave = () => {
    updateUserMutation.mutate({ name, email });
  };

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
    { icon: Lock, label: 'Two Factor Auth', id: '2fa' },
    { icon: Database, label: 'API Tokens', id: 'api' },
    { icon: Users, label: 'Team', id: 'team' },
    { icon: Boxes, label: 'Apps', id: 'apps' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: MessageSquare, label: 'Support', id: 'support' },
  ];

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "rounded-2xl border",
      isDark 
        ? "bg-black/20 border-white/10" 
        : "bg-white/10 border-black/10",
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
              "sticky top-0 md:w-20 border-r",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              <div className="flex md:flex-col md:h-[85vh] p-4 gap-3 items-center">
                {/* Settings Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-6 hidden md:flex",
                  isDark 
                    ? "bg-black/20 border border-white/10" 
                    : "bg-white/10 border border-black/10"
                )}>
                  <SettingsIcon className={cn(
                    "w-5 h-5",
                    isDark ? "text-white/70" : "text-black/70"
                  )} />
                </div>
                
                {/* Navigation Icons */}
                <div className="flex md:flex-col w-full gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl transition-all",
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
                        "w-9 h-9 rounded-lg flex items-center justify-center",
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
                    <GlassContainer className="p-6">
                      <h3 className={cn(
                        "text-lg mb-4",
                        isDark ? "text-white" : "text-black"
                      )}>Your Photo</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden",
                          isDark 
                            ? "bg-black/20 border border-white/10" 
                            : "bg-white/10 border border-black/10"
                        )}>
                          {profilePicture ? (
                            <img 
                              src={profilePicture.startsWith('data') ? profilePicture : `${API_BASE_URL}${profilePicture}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className={cn(
                              "w-8 h-8",
                              isDark ? "text-white/70" : "text-black/70"
                            )} />
                          )}
                        </div>
                        <input
                          type="file"
                          id="profile-picture"
                          accept="image/*"
                          onChange={handleFileChange}
                          hidden
                        />
                        <label htmlFor="profile-picture" className={cn(
                          "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto cursor-pointer text-center",
                          isDark 
                            ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white" 
                            : "bg-white/10 hover:bg-white/20 border border-black/10 text-black",
                          updateButtonOutline
                        )}>
                          Update
                        </label>
                        <button
                          onClick={handleUpdatePicture}
                          disabled={isUpdateDisabled}
                          className={cn(
                            "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto",
                            isDark
                              ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white"
                              : "bg-white/10 hover:bg-white/20 border border-black/10 text-black",
                            !isUpdateDisabled && "outline outline-emerald-500"
                          )}
                        >
                          Save
                        </button>
                      </div>
                    </GlassContainer>

                    <GlassContainer className="p-6 space-y-4">
                      <div>
                        <label className={cn(
                          "block text-sm font-medium mb-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={handleNameChange}
                          className={cn(
                            "w-full px-4 py-2 rounded-xl transition-colors",
                            isDark
                              ? "bg-black/20 border border-white/10 text-white"
                              : "bg-white/10 border border-black/10 text-black",
                            "focus:outline-none focus:ring-2",
                            isDark
                              ? "focus:ring-white/20"
                              : "focus:ring-black/20"
                          )}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "block text-sm font-medium mb-2",
                          isDark ? "text-white/60" : "text-black/60"
                        )}>Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className={cn(
                            "w-full px-4 py-2 rounded-xl transition-colors",
                            isDark
                              ? "bg-black/20 border border-white/10 text-white"
                              : "bg-white/10 border border-black/10 text-black",
                            "focus:outline-none focus:ring-2",
                            isDark
                              ? "focus:ring-white/20"
                              : "focus:ring-black/20"
                          )}
                          placeholder="Enter your email"
                        />
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={cn(
                          "px-4 py-2 rounded-xl transition-colors w-full sm:w-auto",
                          isDark
                            ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white"
                            : "bg-white/10 hover:bg-white/20 border border-black/10 text-black",
                          !isSaveDisabled && "outline outline-emerald-500"
                        )}
                      >
                        Save
                      </button>
                    </GlassContainer>
                  </div>
                </div>
              )}

              {activeTab === '2fa' && (
                <div className="space-y-6">
                  <h2 className={cn(
                    "text-xl font-semibold",
                    isDark ? "text-white" : "text-black"
                  )}>Two-Factor Authentication</h2>

                  <GlassContainer className="p-6">
                    <div className="space-y-6">
                      {!showTwoFactor ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "text-lg font-medium mb-1",
                              isDark ? "text-white" : "text-black"
                            )}>Enable Two-Factor Auth</h3>
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
                              Scan the QR code with your authenticator app
                            </span>
                          </div>
                          
                          <div className="mx-auto">
                            <GlassContainer className="p-4 w-40 h-40">
                              <div className={cn(
                                "w-full h-full rounded-lg flex items-center justify-center text-sm",
                                isDark ? "text-white/70" : "text-black/70"
                              )}>
                                QR Code
                              </div>
                            </GlassContainer>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-2",
                                isDark ? "text-white/60" : "text-black/60"
                              )}>Verification Code</label>
                              <input
                                type="text"
                                className={cn(
                                  "w-full px-4 py-2 rounded-xl transition-colors",
                                  isDark
                                    ? "bg-black/20 border border-white/10 text-white"
                                    : "bg-white/10 border border-black/10 text-black",
                                  "focus:outline-none focus:ring-2",
                                  isDark
                                    ? "focus:ring-white/20"
                                    : "focus:ring-black/20"
                                )}
                                placeholder="Enter the 6-digit code"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button className={cn(
                                "px-4 py-2 rounded-xl transition-colors",
                                isDark 
                                  ? "bg-black/20 hover:bg-black/30 border border-white/10 text-white" 
                                  : "bg-white/10 hover:bg-white/20 border border-black/10 text-black"
                              )}>
                                Verify & Enable
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassContainer>
                </div>
              )}
            </div>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
}