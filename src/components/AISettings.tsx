import React, { useState, useRef, useEffect } from 'react';
import { Database, Bot, MessageSquare, CheckCircle, Plus, Trash2, Save, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
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
          ? "bg-black/40 border border-white/10 text-white"
          : "bg-black/5 border border-black/10 text-black"
      )}
      autoFocus
    />
  );
};

export default function AISettings() {
  const { isDark } = useTheme();
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
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const response = await api.get<KnowledgeData>('/api/knowledge');
      const knowledge = response.data.custom_knowledge;
      
      const entries: KnowledgeBaseEntry[] = Object.entries(knowledge).map(([category, description]) => ({
        id: category,
        category,
        description,
        selected: false
      }));
      
      setKnowledgeBase(entries);
    } catch (error) {
      setShowError(true);
      setErrorMessage('Failed to fetch knowledge base');
    }
  };

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "p-4 sm:p-6 rounded-2xl border transition-all",
      isDark 
        ? "bg-black/40 border-white/10" 
        : "bg-black/5 border-black/10",
      className
    )}>
      {children}
    </div>
  );

  const IconContainer = ({ icon: Icon, color }: { icon: any, color: string }) => (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center",
      isDark ? "bg-black/40" : "bg-black/5"
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
        setErrorMessage('Failed to add knowledge entry');
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
      setErrorMessage('Failed to delete knowledge entry');
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
        setErrorMessage('Failed to update knowledge entry');
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
      setErrorMessage('Error: No entry selected');
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
      setErrorMessage('Error: No entries selected for deletion');
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
      setErrorMessage('Failed to delete selected entries');
    }
  };

  const showConfirmSelection = knowledgeBase.some(entry => entry.selected);
  const showSelectAll = knowledgeBase.length > 1;

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-[95rem] mx-auto">
      <div className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-3xl min-h-[85vh]",
        isDark ? "bg-[#1c1c1c]" : "bg-white",
        "border",
        isDark ? "border-white/10" : "border-black/10",
        "p-4 sm:p-6 md:p-8",
        "transition-colors duration-200"
      )}>
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Knowledge Base Section */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={Database} 
                color={isDark ? "text-blue-400" : "text-blue-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Knowledge Base</h2>
            </div>

            {/* Add New Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                ref={categoryInputRef}
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category"
                className={cn(
                  "w-full p-4 rounded-xl transition-all",
                  "focus:outline-none focus:ring-2",
                  isDark
                    ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                    : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                )}
              />
              <input
                ref={descriptionInputRef}
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description"
                className={cn(
                  "w-full p-4 rounded-xl transition-all",
                  "focus:outline-none focus:ring-2",
                  isDark
                    ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                    : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                )}
              />
            </div>

            {/* Add Entry Button */}
            <button
              onClick={handleAddEntry}
              className={cn(
                "w-full p-4 rounded-xl mb-6 transition-colors flex items-center justify-center gap-2",
                isDark
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-black/10 hover:bg-black/20 text-black"
              )}
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>

            {/* Select All and Confirm Selection Buttons */}
            <div className="flex justify-between items-center mb-4">
              {showSelectAll && (
                <button
                  onClick={handleSelectAllClick}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2",
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-black/10 hover:bg-black/20 text-black"
                  )}
                >
                  {allSelected ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                  {showSelectAllText && "Select All"}
                </button>
              )}
              {showConfirmSelection && (
                <button
                  onClick={handleConfirmSelection}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2",
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-black/10 hover:bg-black/20 text-black"
                  )}
                >
                  <Check className="w-5 h-5" />
                  Confirm Selection
                </button>
              )}
              {showConfirmSelection && (
                <button
                  onClick={handleMultipleDelete}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2",
                    isDark
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                      : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                  )}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Selected
                </button>
              )}
            </div>

            {/* Knowledge Base Entries */}
            <div className="space-y-4">
              {knowledgeBase.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 rounded-xl transition-all",
                    isDark
                      ? "bg-black/40 border border-white/10"
                      : "bg-black/5 border border-black/10"
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-4 items-center">
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer",
                        entry.selected
                          ? isDark
                            ? "bg-white border-white"
                            : "bg-black border-black"
                          : isDark
                            ? "border-white/30"
                            : "border-black/30"
                      )}
                      onClick={() => handleCheckboxChange(entry.id)}
                    >
                      {entry.selected && (
                        <Check 
                          className={cn(
                            isDark ? "text-black" : "text-white"
                          )} 
                          size={16} 
                        />
                      )}
                    </div>
                    <div className={isDark ? "text-white" : "text-black"}>
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
                        <div className={isDark ? "text-white" : "text-black"}>
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
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                              : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                          )}
                        >Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "bg-white/10 hover:bg-white/20 text-white"
                              : "bg-black/10 hover:bg-black/20 text-black"
                          )}
                        >
                          Cancel
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
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "hover:bg-white/10 text-white"
                              : "hover:bg-black/10 text-black"
                          )}
                        >
                          {editingId === entry.id ? (
                            <Save className="w-5 h-5" />
                          ) : (
                            <Edit2 className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDark
                              ? "hover:bg-white/10 text-white"
                              : "hover:bg-black/10 text-black"
                          )}
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
                className={cn(
                  "mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300",
                  isDark
                    ? "bg-green-500/20 text-green-300"
                    : "bg-green-500/20 text-green-700"
                )}
              >
                Selected
              </div>
            )}
            {showError && (
              <div 
                className={cn(
                  "mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300",
                  isDark
                    ? "bg-red-500/20 text-red-300"
                    : "bg-red-500/20 text-red-700"
                )}
              >
                {errorMessage}
              </div>
            )}
            {showMultipleDeleteWarning && (
              <div 
                className={cn(
                  "mt-6 p-4 rounded-xl text-center font-medium transition-opacity duration-300",
                  isDark
                    ? "bg-red-500/20 text-red-300"
                    : "bg-red-500/20 text-red-700"
                )}
              >
                Are you sure you want to delete the selected entries?
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    onClick={confirmMultipleDelete}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isDark
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                    )}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowMultipleDeleteWarning(false)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isDark
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/10 hover:bg-black/20 text-black"
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </GlassContainer>

          {/* Personality Settings */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={Bot} 
                color={isDark ? "text-purple-400" : "text-purple-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Personality Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  AI Name
                </label>
                <input
                  ref={aiNameInputRef}
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  className={cn(
                    "w-full p-4 rounded-xl transition-all",
                    "focus:outline-none focus:ring-2",
                    isDark
                      ? "bg-black/40 border border-white/10 text-white placeholder-white/30 focus:ring-white/20"
                      : "bg-black/5 border border-black/10 text-black placeholder-black/30 focus:ring-black/20"
                  )}
                  placeholder="Enter AI assistant name"
                />
              </div>
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Tone of Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Professional', 'Friendly', 'Casual', 'Formal'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setTone(option)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        tone === option 
                          ? isDark
                            ? "bg-black/60 border-white/20 text-white"
                            : "bg-black/10 border-black/20 text-black"
                          : isDark
                            ? "bg-black/40 border-white/10 text-white/60 hover:bg-black/50"
                            : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassContainer>

          {/* Response Settings */}
          <GlassContainer>
            <div className="flex items-center gap-4 mb-6">
              <IconContainer 
                icon={MessageSquare} 
                color={isDark ? "text-emerald-400" : "text-emerald-600"} 
              />
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>Response Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Response Length
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {['Concise', 'Moderate', 'Detailed'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setLength(option)}
                      className={cn(
                        "flex-1 p-3 rounded-xl border text-sm font-medium transition-all",
                        length === option 
                          ? isDark
                            ? "bg-black/60 border-white/20 text-white"
                            : "bg-black/10 border-black/20 text-black"
                          : isDark
                            ? "bg-black/40 border-white/10 text-white/60 hover:bg-black/50"
                            : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <button
                  onClick={() => setEnableFollowUp(!enableFollowUp)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all w-full sm:w-auto",
                    enableFollowUp
                      ? isDark
                        ? "bg-black/60 border-white/20 text-white"
                        : "bg-black/10 border-black/20 text-black"
                      : isDark
                        ? "bg-black/40 border-white/10 text-white/60"
                        : "bg-black/5 border-black/10 text-black/60"
                  )}
                >
                  <CheckCircle className={cn(
                    "w-5 h-5",
                    enableFollowUp 
                      ? isDark 
                        ? "text-white" 
                        : "text-black"
                      : "opacity-0"
                  )} />
                  <span>Enable follow-up questions</span>
                </button>
              </div>
            </div>
          </GlassContainer>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button className={cn(
              "px-6 py-2.5 rounded-xl transition-all font-medium",
              isDark 
                ? "bg-black/40 hover:bg-black/60 text-white border border-white/10" 
                : "bg-black/5 hover:bg-black/10 text-black border border-black/10"
            )}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

