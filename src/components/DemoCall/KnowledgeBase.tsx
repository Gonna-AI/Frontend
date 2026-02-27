import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Settings,
  Terminal,
  Volume2,
  Check,
  CloudOff,
  Monitor,
  Loader2,
  Database
} from 'lucide-react';
import { cn } from '../../utils/cn';
import VoiceSelector from './VoiceSelector';
import { useDemoCall, ContextField } from '../../contexts/DemoCallContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { localLLMService } from '../../services/localLLMService';
import { DEFAULT_VOICE_ID, normalizeVoiceId } from '../../config/voiceConfig';

// Define the tabs structure
type ActiveTab = 'prompt' | 'voice' | 'fields' | 'categories' | 'rules' | 'instructions';

interface KnowledgeBaseProps {
  isDark?: boolean;
  activeSection?: string;
}

interface KnowledgeBaseState {
  systemPrompt: string;
  persona: string;
  greeting: string;
  contextFields: ContextField[];
  categories: any[];
  priorityRules: string[];
  customInstructions: string[];
  responseGuidelines: string;
  aiVoice: string;
}

export default function KnowledgeBase({ isDark = true, activeSection }: KnowledgeBaseProps) {
  const {
    knowledgeBase: contextKB,
    updateKnowledgeBase: updateContextKB,
    saveKnowledgeBase: saveContextKB,
    addContextField,
    removeContextField,
    addCategory,
    removeCategory
  } = useDemoCall();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>((activeSection as ActiveTab) || 'prompt');

  // Local state for immediate UI updates
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseState>({
    systemPrompt: '',
    persona: '',
    greeting: '',
    contextFields: [],
    categories: [],
    priorityRules: [],
    customInstructions: [],
    responseGuidelines: '',
    aiVoice: DEFAULT_VOICE_ID
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // LLM Connection State
  const [localLLMConnected, setLocalLLMConnected] = useState(false);
  const [localLLMModel, setLocalLLMModel] = useState<string>('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // New item states
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<ContextField>>({ name: '', type: 'text', required: false, description: '' });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: 'blue' });

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState('');

  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [newInstruction, setNewInstruction] = useState('');

  // Sync with context on mount/update
  useEffect(() => {
    if (contextKB) {
      setKnowledgeBase({
        systemPrompt: contextKB.systemPrompt || '',
        persona: contextKB.persona || '',
        greeting: contextKB.greeting || '',
        contextFields: contextKB.contextFields || [],
        categories: contextKB.categories || [],
        priorityRules: contextKB.priorityRules || [],
        customInstructions: contextKB.customInstructions || [],
        responseGuidelines: contextKB.responseGuidelines || '',
        aiVoice: normalizeVoiceId(contextKB.selectedVoiceId, DEFAULT_VOICE_ID)
      });
    }
  }, [contextKB]);

  // Handle active section prop change
  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection as ActiveTab);
    }
  }, [activeSection]);

  // Test LLM Connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    const connected = await localLLMService.checkConnection();
    setLocalLLMConnected(connected);
    if (connected) {
      const model = localLLMService.getModel();
      setLocalLLMModel(model);
    }
    setIsTestingConnection(false);
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update local state and context
  const updateKnowledgeBase = (updates: Partial<KnowledgeBaseState>) => {
    setKnowledgeBase(prev => {
      const newState = { ...prev, ...updates };
      // Sync to context immediately
      if (updates.aiVoice) updateContextKB({ selectedVoiceId: normalizeVoiceId(updates.aiVoice, DEFAULT_VOICE_ID) });
      if (updates.systemPrompt) updateContextKB({ systemPrompt: updates.systemPrompt });
      if (updates.persona) updateContextKB({ persona: updates.persona });
      if (updates.greeting) updateContextKB({ greeting: updates.greeting });
      if (updates.responseGuidelines) updateContextKB({ responseGuidelines: updates.responseGuidelines });
      if (updates.priorityRules) updateContextKB({ priorityRules: updates.priorityRules });
      if (updates.customInstructions) updateContextKB({ customInstructions: updates.customInstructions });

      return newState;
    });
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
      await saveContextKB();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler functions for lists
  const handleAddField = () => {
    if (!newField.name) return;
    const field: ContextField = {
      id: newField.name.toLowerCase().replace(/\s+/g, '_'),
      name: newField.name,
      description: newField.description || '',
      type: newField.type as any || 'text',
      required: newField.required || false
    };
    addContextField(field);
    setNewField({ name: '', type: 'text', required: false, description: '' });
    setIsAddingField(false);
  };

  // ... (Other handlers omitted for brevity but implementing logic below)
  const handleAddCategory = () => {
    if (!newCategory.name) return;
    const cat = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '_'),
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color
    };
    addCategory(cat);
    setNewCategory({ name: '', description: '', color: 'blue' });
    setIsAddingCategory(false);
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    updateKnowledgeBase({ priorityRules: [...knowledgeBase.priorityRules, newRule] });
    setNewRule('');
    setIsAddingRule(false);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...knowledgeBase.priorityRules];
    newRules.splice(index, 1);
    updateKnowledgeBase({ priorityRules: newRules });
  };

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;
    updateKnowledgeBase({ customInstructions: [...knowledgeBase.customInstructions, newInstruction] });
    setNewInstruction('');
    setIsAddingInstruction(false);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...knowledgeBase.customInstructions];
    newInstructions.splice(index, 1);
    updateKnowledgeBase({ customInstructions: newInstructions });
  };


  const tabInfo = {
    prompt: { label: t('sidebar.systemPrompt'), icon: Terminal, description: "Define the core identity and behavior of your AI agent." },
    voice: { label: t('sidebar.aiVoice'), icon: Volume2, description: "Choose the voice that best fits your brand personality." },
    fields: { label: t('sidebar.contextFields'), icon: Database, description: "Structured data to extract from every conversation." },
    categories: { label: t('sidebar.categories'), icon: Settings, description: "Call classification buckets for analytics." },
    rules: { label: t('sidebar.priorityRules'), icon: AlertTriangle, description: "Logic for determining call priority levels." },
    instructions: { label: t('sidebar.instructions'), icon: Lightbulb, description: "Specific behavioral guidelines for the agent." }
  };

  const currentTabInfo = tabInfo[activeTab];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            {currentTabInfo.label}
          </h1>
          <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-gray-500")}>
            {currentTabInfo.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            title={localLLMConnected ? `${t('config.groqConnected')}: ${localLLMModel}` : t('config.groqOffline')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              isTestingConnection
                ? (isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-black/5 border-black/5 text-black/50")
                : localLLMConnected
                  ? (isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                  : (isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-700")
            )}
          >
            {isTestingConnection ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : localLLMConnected ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {localLLMConnected ? t('config.groqConnected') : t('config.groqOffline')}
            </span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveToSupabase}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
              saveSuccess
                ? "bg-emerald-500 text-white border-transparent"
                : "bg-white text-black hover:bg-gray-100 border border-gray-200"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? t('config.saved') : t('config.save')}</span>
          </button>
        </div>
      </div>

      {/* Content Area - Conditional Wrapper to avoid nested cards for Voice Tab */}
      {activeTab === 'voice' ? (
        <motion.div
          key="voice"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <VoiceSelector
            selectedVoiceId={knowledgeBase.aiVoice}
            onVoiceSelect={(voiceId) => updateKnowledgeBase({ aiVoice: voiceId })}
            onSave={handleSaveToSupabase}
            isDark={isDark}
          />
        </motion.div>
      ) : (
        /* Main Settings Card */
        <div className={cn(
          "p-6 rounded-xl border min-h-[400px]",
          isDark ? "bg-[#09090B] border-white/10 text-white" : "bg-white border-black/10 text-black"
        )}>
          <AnimatePresence mode="wait">
            {/* System Prompt Tab */}
            {activeTab === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <textarea
                    value={knowledgeBase.systemPrompt}
                    onChange={(e) => updateKnowledgeBase({ systemPrompt: e.target.value })}
                    rows={12}
                    className={cn(
                      "w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 transition-all",
                      isDark
                        ? "bg-white/5 text-white border border-white/10 focus:ring-white/20 focus:border-white/20"
                        : "bg-gray-50 text-black border border-gray-200 focus:ring-gray-300 focus:border-gray-300"
                    )}
                    placeholder={t('config.systemPromptDesc')}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
                      {t('config.persona')}
                    </label>
                    <input
                      value={knowledgeBase.persona}
                      onChange={(e) => updateKnowledgeBase({ persona: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all",
                        isDark
                          ? "bg-white/5 text-white border border-white/10 focus:ring-white/20 focus:border-white/20"
                          : "bg-gray-50 text-black border border-gray-200 focus:ring-gray-300 focus:border-gray-300"
                      )}
                      placeholder={t('config.personaPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
                      {t('config.greeting')}
                    </label>
                    <input
                      value={knowledgeBase.greeting}
                      onChange={(e) => updateKnowledgeBase({ greeting: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all",
                        isDark
                          ? "bg-white/5 text-white border border-white/10 focus:ring-white/20 focus:border-white/20"
                          : "bg-gray-50 text-black border border-gray-200 focus:ring-gray-300 focus:border-gray-300"
                      )}
                      placeholder={t('config.greetingPlaceholder')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Context Fields Tab */}
            {activeTab === 'fields' && (
              <motion.div key="fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className={cn("flex justify-between items-center pb-4 border-b", isDark ? "border-white/10" : "border-gray-100")}>
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Data Collection Fields</h3>
                  <button onClick={() => setIsAddingField(true)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors", isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")}>
                    Add Field
                  </button>
                </div>

                {/* New Field Form */}
                <AnimatePresence>
                  {isAddingField && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                      <div className={cn("p-4 rounded-lg space-y-3 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <input
                          placeholder="Field Name (e.g. Order Number)"
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          className={cn(
                            "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                            isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                          )}
                        />
                        <input
                          placeholder="Description (optional)"
                          value={newField.description}
                          onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                          className={cn(
                            "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                            isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                          )}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setIsAddingField(false)} className={cn("text-xs px-3 py-1.5 rounded hover:bg-white/10", isDark ? "text-white/60" : "text-black/60")}>Cancel</button>
                          <button onClick={handleAddField} className={cn("text-xs font-semibold px-3 py-1.5 rounded bg-white text-black")}>Save Field</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Field List */}
                <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-100")}>
                  {knowledgeBase.contextFields.map(field => (
                    <div key={field.id} className="py-4 flex items-center justify-between group transition-colors px-2 rounded-lg hover:bg-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{field.name}</span>
                          {field.required && <span className="text-rose-400 text-xs font-medium bg-rose-400/10 px-1.5 py-0.5 rounded-full">Required</span>}
                          <span className={cn("text-[10px] uppercase border px-1.5 py-0.5 rounded font-medium", isDark ? "text-white/40 border-white/10" : "text-gray-500 border-gray-200")}>{field.type}</span>
                        </div>
                        {field.description && <p className={cn("text-xs mt-1", isDark ? "text-white/40" : "text-gray-500")}>{field.description}</p>}
                      </div>
                      <button onClick={() => removeContextField(field.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-2 hover:bg-rose-400/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {knowledgeBase.contextFields.length === 0 && (
                    <p className={cn("text-center py-8 text-sm italic", isDark ? "text-white/20" : "text-black/20")}>No fields configured yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={cn("flex justify-between items-center pb-4 border-b", isDark ? "border-white/10" : "border-gray-100")}>
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Call Categories</h3>
                  <button onClick={() => setIsAddingCategory(true)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors", isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")}>
                    Add Category
                  </button>
                </div>

                {/* New Category Form */}
                <AnimatePresence>
                  {isAddingCategory && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                      <div className={cn("p-4 rounded-lg space-y-3 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="Category Name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            className={cn(
                              "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                              isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                            )}
                          />
                          <input
                            placeholder="Description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            className={cn(
                              "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                              isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn("text-xs opacity-60 mr-2", isDark ? "text-white" : "text-black")}>Color:</span>
                          {['blue', 'orange', 'red', 'green', 'purple', 'emerald'].map(color => (
                            <button
                              key={color}
                              onClick={() => setNewCategory({ ...newCategory, color })}
                              className={cn(
                                "w-5 h-5 rounded-full transition-transform hover:scale-110 border-2",
                                newCategory.color === color ? "border-white scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setIsAddingCategory(false)} className={cn("text-xs px-3 py-1.5 rounded hover:bg-white/10", isDark ? "text-white/60" : "text-black/60")}>Cancel</button>
                          <button onClick={handleAddCategory} className={cn("text-xs font-semibold px-3 py-1.5 rounded bg-white text-black")}>Save Category</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-100")}>
                  {knowledgeBase.categories.map(cat => (
                    <div key={cat.id} className="py-4 flex items-center justify-between group px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full")} style={{ backgroundColor: cat.color || 'gray' }} />
                        <div>
                          <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{cat.name}</p>
                          <p className={cn("text-xs", isDark ? "text-white/40" : "text-gray-500")}>{cat.description}</p>
                        </div>
                      </div>
                      <button onClick={() => removeCategory(cat.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-2 hover:bg-rose-400/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {knowledgeBase.categories.length === 0 && (
                    <p className={cn("text-center py-8 text-sm italic", isDark ? "text-white/20" : "text-black/20")}>No categories defined.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={cn("flex justify-between items-center pb-4 border-b", isDark ? "border-white/10" : "border-gray-100")}>
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Priority Rules</h3>
                  <button onClick={() => setIsAddingRule(true)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors", isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")}>
                    Add Rule
                  </button>
                </div>

                {isAddingRule && (
                  <div className={cn("p-4 rounded-lg space-y-3 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                    <input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="e.g. Mark as HIGH if user mentions 'cancel'"
                      className={cn(
                        "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                        isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setIsAddingRule(false)} className={cn("text-xs px-3 py-1.5 rounded hover:bg-white/10", isDark ? "text-white/60" : "text-black/60")}>Cancel</button>
                      <button onClick={handleAddRule} className="text-xs font-semibold px-3 py-1.5 rounded bg-white text-black">Save Rule</button>
                    </div>
                  </div>
                )}
                <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-100")}>
                  {knowledgeBase.priorityRules.map((rule, i) => (
                    <div key={i} className="py-4 flex items-start gap-3 group px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <p className={cn("flex-1 text-sm leading-relaxed", isDark ? "text-white/80" : "text-gray-700")}>{rule}</p>
                      <button onClick={() => handleRemoveRule(i)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-2 hover:bg-rose-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {knowledgeBase.priorityRules.length === 0 && (
                    <p className={cn("text-center py-8 text-sm italic", isDark ? "text-white/20" : "text-black/20")}>No priority rules defined.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <motion.div key="instructions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={cn("flex justify-between items-center pb-4 border-b", isDark ? "border-white/10" : "border-gray-100")}>
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Custom Instructions</h3>
                  <button onClick={() => setIsAddingInstruction(true)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors", isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")}>
                    Add Instruction
                  </button>
                </div>

                {isAddingInstruction && (
                  <div className={cn("p-4 rounded-lg space-y-3 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                    <input
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      placeholder="e.g. Always ask for email confirmation"
                      className={cn(
                        "w-full bg-transparent border-b pb-2 focus:outline-none text-sm",
                        isDark ? "border-white/10 focus:border-white/40 placeholder-white/20" : "border-black/10 focus:border-black/20 placeholder-black/40"
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setIsAddingInstruction(false)} className={cn("text-xs px-3 py-1.5 rounded hover:bg-white/10", isDark ? "text-white/60" : "text-black/60")}>Cancel</button>
                      <button onClick={handleAddInstruction} className="text-xs font-semibold px-3 py-1.5 rounded bg-white text-black">Save Instruction</button>
                    </div>
                  </div>
                )}
                <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-100")}>
                  {knowledgeBase.customInstructions.map((inst, i) => (
                    <div key={i} className="py-4 flex items-start gap-3 group px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-medium border border-purple-500/20">{i + 1}</span>
                      <p className={cn("flex-1 text-sm leading-relaxed", isDark ? "text-white/80" : "text-gray-700")}>{inst}</p>
                      <button onClick={() => handleRemoveInstruction(i)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-2 hover:bg-rose-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {knowledgeBase.customInstructions.length === 0 && (
                    <p className={cn("text-center py-8 text-sm italic", isDark ? "text-white/20" : "text-black/20")}>No custom instructions defined.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
