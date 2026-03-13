import React, { useState, useRef, useEffect } from 'react';
import { Database, Bot, MessageSquare, CheckCircle, Plus, Trash2, Save, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';
import api from '../config/api';

interface KnowledgeData {
  custom_knowledge: {
    [key: string]: string;
  };
}

interface KnowledgeBaseEntry {
  id: string;
  category: string;
  description: string;
  selected?: boolean;
}

// Add new interface for settings data
interface SettingsData {
  ai_name: string;
  tone_of_voice: string;
  response_style: string;
  response_length: string;
  enable_follow_up: boolean;
  custom_knowledge: {
    [key: string]: string;
  };
}

const EditableInput = ({
  value,
  onChange,
  onSave,
  isDark
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isDark: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      className={cn(
        "w-full p-4 rounded-xl transition-all",
        "focus:outline-none focus:ring-2",
        isDark
          ? "bg-white/5 border border-white/10 text-white focus:ring-[#FF8A5B]/20"
          : "bg-black/5 border border-black/10 text-black"
      )}
      autoFocus
    />
  );
};

export default function AISettings() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [aiName, setAiName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Moderate');
  const [enableFollowUp, setEnableFollowUp] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null);
  const [showSelectedDialog, setShowSelectedDialog] = useState(false);
  const [showSelectAllText, setShowSelectAllText] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMultipleDeleteWarning, setShowMultipleDeleteWarning] = useState(false);

  const categoryInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const aiNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryInputRef.current?.focus();
  }, [newCategory]);

  useEffect(() => {
    descriptionInputRef.current?.focus();
  }, [newDescription]);

  useEffect(() => {
    aiNameInputRef.current?.focus();
  }, [aiName]);

  useEffect(() => {
    if (showSelectedDialog) {
      const timer = setTimeout(() => {
        setShowSelectedDialog(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSelectedDialog]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<SettingsData>('/api/knowledge');
        const data = response.data;

        // Update states with received values
        setAiName(data.ai_name || '');
        setTone(data.tone_of_voice || '');
        setLength(data.response_length || '');
        setEnableFollowUp(data.enable_follow_up);

        // Handle knowledge base data
        const knowledge = data.custom_knowledge;
        const entries: KnowledgeBaseEntry[] = Object.entries(knowledge).map(([category, description]) => ({
          id: category,
          category,
          description,
          selected: false
        }));

        setKnowledgeBase(entries);
      } catch (error) {
        setShowError(true);
        setErrorMessage(t('ai.fetchFailed'));
      }
    };

    fetchData();
  }, []);

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "p-4 sm:p-6 rounded-2xl border transition-all",
      isDark
        ? "bg-white/5 border-white/10 backdrop-blur-md"
        : "bg-black/5 border-black/10",
      className
    )}>
      {children}
    </div>
  );

  const IconContainer = ({ icon: Icon, color }: { icon: any, color: string }) => (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center",
      isDark ? "bg-white/5" : "bg-black/5"
    )}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
  );

  const handleAddEntry = async () => {
    if (newCategory.trim() && newDescription.trim()) {
      try {
        await api.post('/api/knowledge', {
          category: newCategory,
          content: newDescription
        });

        setKnowledgeBase([
          ...knowledgeBase,
          {
            id: newCategory,
            category: newCategory,
            description: newDescription,
            selected: false
          }
        ]);

        setNewCategory('');
        setNewDescription('');
        categoryInputRef.current?.focus();
      } catch (error) {
        setShowError(true);
        setErrorMessage(t('ai.addFailed'));
      }
    }
  };

  const handleDeleteEntry = (id: string) => {
    setShowDeleteWarning(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete('/api/knowledge', {
        data: {
          categories: [id]
        }
      });

      setKnowledgeBase(knowledgeBase.filter(entry => entry.id !== id));
      setShowDeleteWarning(null);
    } catch (error) {
      setShowError(true);
      setErrorMessage(t('ai.deleteFailed'));
    }
  };

  const cancelDelete = () => {
    setShowDeleteWarning(null);
  };

  const handleStartEdit = (entry: KnowledgeBaseEntry) => {
    setEditingId(entry.id);
    setEditingValue(entry.description);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await api.put(`/api/knowledge/${editingId}`, {
          content: editingValue
        });

        setKnowledgeBase(knowledgeBase.map(entry =>
          entry.id === editingId
            ? { ...entry, description: editingValue }
            : entry
        ));

        setEditingId(null);
        setEditingValue('');
      } catch (error) {
        setShowError(true);
        setErrorMessage(t('ai.updateFailed'));
      }
    }
  };

  const handleCheckboxChange = (id: string) => {
    setKnowledgeBase(knowledgeBase.map(entry =>
      entry.id === id ? { ...entry, selected: !entry.selected } : entry
    ));
  };

  const handleSelectAllClick = () => {
    if (allSelected) {
      setAllSelected(false);
      setShowSelectAllText(false);
      setKnowledgeBase(knowledgeBase.map(entry => ({ ...entry, selected: false })));
    } else {
      setAllSelected(true);
      setShowSelectAllText(true);
      setKnowledgeBase(knowledgeBase.map(entry => ({ ...entry, selected: true })));
    }
  };

  const handleConfirmSelection = () => {
    const selectedEntries = knowledgeBase.filter(entry => entry.selected);
    if (selectedEntries.length === 0) {
      setShowError(true);
      setErrorMessage(t('ai.noSelectionError'));
    } else {
      setShowSelectedDialog(true);
      setAllSelected(false);
      setShowSelectAllText(false);
      setKnowledgeBase(knowledgeBase.map(entry => ({ ...entry, selected: false })));
    }
  };

  const handleMultipleDelete = () => {
    const selectedEntries = knowledgeBase.filter(entry => entry.selected);
    if (selectedEntries.length > 0) {
      setShowMultipleDeleteWarning(true);
    } else {
      setShowError(true);
      setErrorMessage(t('ai.noDeleteSelectionError'));
    }
  };

  const confirmMultipleDelete = async () => {
    try {
      const categoriesToDelete = knowledgeBase
        .filter(entry => entry.selected)
        .map(entry => entry.category);

      await api.delete('/api/knowledge', {
        data: {
          categories: categoriesToDelete
        }
      });

      setKnowledgeBase(knowledgeBase.filter(entry => !entry.selected));
      setShowMultipleDeleteWarning(false);
      setAllSelected(false);
      setShowSelectAllText(false);
    } catch (error) {
      setShowError(true);
      setErrorMessage(t('ai.multiDeleteFailed'));
    }
  };

  const showConfirmSelection = knowledgeBase.some(entry => entry.selected);
  const showSelectAll = knowledgeBase.length > 1;

  const handleSaveSettings = async () => {
    try {
      await api.put('/api/settings', {
        ai_name: aiName,
        tone_of_voice: tone,
        response_style: 'Moderate', // This seems to be fixed in your backend
        response_length: length,
        enable_follow_up: enableFollowUp
      });

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      setShowError(true);
      setErrorMessage(t('ai.settingsUpdateFailed'));
    }
  };

  // Add theme helper function to match Documents page
  const getThemeColors = () => ({
    background: isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-800',
    cardBg: isDark ? 'bg-white/5' : 'bg-white',
    border: isDark ? 'border-white/10' : 'border-gray-200',
    inputBg: isDark ? 'bg-white/5' : 'bg-white',
    inputBorder: isDark ? 'border-[#FF8A5B]/20' : 'border-orange-200',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    statsBg: isDark ? 'bg-[#FF8A5B]/10' : 'bg-orange-50',
    statsBorder: isDark ? 'border-[#FF8A5B]/20' : 'border-orange-100',
  });

  const theme = getThemeColors();

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 rounded-3xl relative overflow-hidden",
      isDark ? "bg-[#0A0A0A]" : "bg-gradient-to-b from-gray-50 to-white"
    )}>
      {isDark && (
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#FF8A5B]/10 blur-[140px]" />
          <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[120px]" />
          <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/6 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
        </div>
      )}

      <div className={`min-h-screen ${theme.text} p-6 transition-colors duration-200 relative z-10`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${theme.text}`}>{t('ai.customisation')}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Base Section - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-3xl p-6`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <Database className={isDark ? "text-[#FFB286]" : "text-orange-600"} />
                </div>
                <h2 className="text-lg font-semibold">{t('ai.knowledgeBase')}</h2>
              </div>

              {/* Add Entry Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  ref={categoryInputRef}
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t('ai.categoryPlaceholder')}
                  className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 ${isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-[#FF8A5B]/20 focus:border-[#FF8A5B]/30"
                    : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                  }`}
                />
                <input
                  ref={descriptionInputRef}
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('ai.descriptionPlaceholder')}
                  className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 ${isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-[#FF8A5B]/20 focus:border-[#FF8A5B]/30"
                    : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                  }`}
                />
              </div>

              {/* Add Entry Button */}
              <button
                onClick={handleAddEntry}
                className={`w-full p-4 rounded-xl mb-6 transition-colors flex items-center justify-center gap-2 ${isDark
                    ? "bg-[#FF8A5B]/10 hover:bg-[#FF8A5B]/20 text-[#FFB286]"
                    : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  }`}
              >
                <Plus className="w-5 h-5" />
                {t('ai.addEntry')}
              </button>

              {/* Select All and Confirm Selection Buttons */}
              <div className="flex justify-between items-center mb-4">
                {showSelectAll && (
                  <button
                    onClick={handleSelectAllClick}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isDark
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/10 hover:bg-black/20 text-black"
                      }`}
                  >
                    {allSelected ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    {showSelectAllText && t('ai.selectAll')}
                  </button>
                )}
                {showConfirmSelection && (
                  <button
                    onClick={handleConfirmSelection}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isDark
                        ? "bg-[#FF8A5B]/10 hover:bg-[#FF8A5B]/20 text-[#FFB286]"
                        : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                      }`}
                  >
                    <Check className="w-5 h-5" />
                    {t('ai.confirmSelection')}
                  </button>
                )}
                {showConfirmSelection && (
                  <button
                    onClick={handleMultipleDelete}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isDark
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                      }`}
                  >
                    <Trash2 className="w-5 h-5" />
                    {t('ai.deleteSelected')}
                  </button>
                )}
              </div>

              {/* Knowledge Base Entries */}
              <div className="space-y-4">
                {knowledgeBase.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl transition-all ${isDark
                        ? "bg-white/5 backdrop-blur-md border border-white/10"
                        : "bg-black/5 border border-black/10"
                      }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-4 items-center">
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${entry.selected
                            ? isDark
                              ? "bg-white border-white"
                              : "bg-black border-black"
                            : isDark
                              ? "border-white/30"
                              : "border-black/30"
                          }`}
                        onClick={() => handleCheckboxChange(entry.id)}
                      >
                        {entry.selected && (
                          <Check
                            className={`${isDark ? "text-black" : "text-white"}`}
                            size={16}
                          />
                        )}
                      </div>
                      <div className={`${isDark ? "text-white" : "text-black"}`}>
                        {entry.category}
                      </div>
                      <div className="md:col-span-2">
                        {editingId === entry.id ? (
                          <EditableInput
                            value={editingValue}
                            onChange={setEditingValue}
                            onSave={handleSaveEdit}
                            isDark={isDark}
                          />
                        ) : (
                          <div className={`${isDark ? "text-white" : "text-black"}`}>
                            {entry.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      {showDeleteWarning === entry.id ? (
                        <>
                          <button
                            onClick={() => confirmDelete(entry.id)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                              }`}
                          >{t('ai.deleteConfirm')}
                          </button>
                          <button
                            onClick={cancelDelete}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? "bg-white/10 hover:bg-white/20 text-white"
                                : "bg-black/10 hover:bg-black/20 text-black"
                              }`}
                          >
                            {t('ai.deleteCancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (editingId === entry.id) {
                                handleSaveEdit();
                              } else {
                                handleStartEdit(entry);
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-black/10 text-black"
                              }`}
                          >
                            {editingId === entry.id ? (
                              <Save className="w-5 h-5" />
                            ) : (
                              <Edit2 className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-black/10 text-black"
                              }`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {showSelectedDialog && (
                <div
                  className={`mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300 ${isDark
                      ? "bg-[#FF8A5B]/10 text-[#FFB286]"
                      : "bg-orange-100 text-orange-700"
                    }`}
                >
                  {t('ai.selected')}
                </div>
              )}
              {showError && (
                <div
                  className={`mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300 ${isDark
                      ? "bg-red-500/20 text-red-300"
                      : "bg-red-500/20 text-red-700"
                    }`}
                >
                  {errorMessage}
                </div>
              )}
              {showMultipleDeleteWarning && (
                <div
                  className={`mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300 ${isDark
                      ? "bg-red-500/20 text-red-300"
                      : "bg-red-500/20 text-red-700"
                    }`}
                >
                  {t('ai.deleteWarning')}
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      onClick={confirmMultipleDelete}
                      className={`p-2 rounded-lg transition-colors ${isDark
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                          : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                        }`}
                    >
                      {t('ai.deleteSelectedConfirm')}
                    </button>
                    <button
                      onClick={() => setShowMultipleDeleteWarning(false)}
                      className={`p-2 rounded-lg transition-colors ${isDark
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-black/10 hover:bg-black/20 text-black"
                        }`}
                    >
                      {t('ai.deleteCancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel - Takes up 1 column */}
          <div className="space-y-6">
            {/* Personality Settings */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-3xl p-6`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <Bot className={isDark ? "text-[#FFB286]" : "text-orange-600"} />
                </div>
                <h2 className="text-lg font-semibold">{t('ai.personality')}</h2>
              </div>

              {/* AI Name Input */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>
                    {t('ai.nameLabel')}
                  </label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 ${isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-[#FF8A5B]/20 focus:border-[#FF8A5B]/30"
                    : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                  }`}
                  />
                </div>

                {/* Tone Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>
                    {t('ai.toneLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Professional', 'Friendly', 'Casual', 'Formal'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setTone(option)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${tone === option
                            ? isDark
                              ? "bg-white/10 border-[#FF8A5B]/40 text-white"
                              : "bg-black/10 border-black/20 text-black"
                            : isDark
                              ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                          }`}
                      >
                        {t(`ai.tone.${option.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Settings */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-3xl p-6`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <MessageSquare className={isDark ? "text-[#FFB286]" : "text-orange-600"} />
                </div>
                <h2 className="text-lg font-semibold">{t('ai.responseSettings')}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme.secondaryText}`}>
                    {t('ai.lengthLabel')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {['Concise', 'Moderate', 'Detailed'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setLength(option)}
                        className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${length === option
                            ? isDark
                              ? "bg-white/10 border-[#FF8A5B]/40 text-white"
                              : "bg-black/10 border-black/20 text-black"
                            : isDark
                              ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                          }`}
                      >
                        {t(`ai.length.${option.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setEnableFollowUp(!enableFollowUp)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all w-full sm:w-auto ${enableFollowUp
                        ? isDark
                          ? "bg-white/10 border-[#FF8A5B]/40 text-white"
                          : "bg-black/10 border-black/20 text-black"
                        : isDark
                          ? "bg-white/5 border-white/10 text-white/60"
                          : "bg-black/5 border-black/10 text-black/60"
                      }`}
                  >
                    <CheckCircle className={`w-5 h-5 ${enableFollowUp
                        ? isDark
                          ? "text-white"
                          : "text-black"
                        : "opacity-0"
                      }`} />
                    <span>{t('ai.enableFollowUp')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className={`w-full py-3 px-4 rounded-xl transition-all font-medium ${isDark
                  ? "bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] text-white shadow-lg shadow-[#FF8A5B]/20"
                  : "bg-orange-200 hover:bg-orange-300 text-orange-800"
                }`}
            >
              {t('ai.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
