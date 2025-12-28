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
    aiVoice: 'af_nova'
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
        aiVoice: contextKB.selectedVoiceId || 'af_nova'
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
      if (updates.aiVoice) updateContextKB({ selectedVoiceId: updates.aiVoice });
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
    prompt: { label: t('config.systemPrompt'), icon: Terminal, description: "Define the core identity and behavior of your AI agent." },
    voice: { label: t('config.voice'), icon: Volume2, description: "Choose the voice that best fits your brand personality." },
    fields: { label: t('config.fields'), icon: Database, description: "Structured data to extract from every conversation." },
    categories: { label: t('config.categories'), icon: Settings, description: "Call classification buckets for analytics." },
    rules: { label: t('config.rules'), icon: AlertTriangle, description: "Logic for determining call priority levels." },
    instructions: { label: t('config.instructions'), icon: Lightbulb, description: "Specific behavioral guidelines for the agent." }
  };

  const currentTabInfo = tabInfo[activeTab];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold flex items-center gap-2", isDark ? "text-white" : "text-black")}>
            <currentTabInfo.icon className="w-6 h-6 opacity-80" />
            {currentTabInfo.label}
          </h1>
          <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
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
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isTestingConnection
                ? isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"
                : localLLMConnected
                  ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/10 text-green-600"
                  : isDark ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-600"
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
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              saveSuccess
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-black text-white hover:bg-black/90"
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
          isDark ? "bg-black/40 border-white/10 text-white" : "bg-white border-black/10 text-black"
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
                  <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-black/80")}>
                    {t('config.systemPrompt')}
                  </label>
                  <textarea
                    value={knowledgeBase.systemPrompt}
                    onChange={(e) => updateKnowledgeBase({ systemPrompt: e.target.value })}
                    rows={12}
                    className={cn(
                      "w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-white/5 text-white border border-white/10 focus:ring-white/20"
                        : "bg-black/5 text-black border border-black/10 focus:ring-black/20"
                    )}
                    placeholder={t('config.systemPromptDesc')}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-black/80")}>
                      {t('config.persona')}
                    </label>
                    <input
                      value={knowledgeBase.persona}
                      onChange={(e) => updateKnowledgeBase({ persona: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-2",
                        isDark
                          ? "bg-white/5 text-white border border-white/10 focus:ring-white/20"
                          : "bg-black/5 text-black border border-black/10 focus:ring-black/20"
                      )}
                      placeholder={t('config.personaPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-black/80")}>
                      {t('config.greeting')}
                    </label>
                    <input
                      value={knowledgeBase.greeting}
                      onChange={(e) => updateKnowledgeBase({ greeting: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-xl text-sm focus:outline-none focus:ring-2",
                        isDark
                          ? "bg-white/5 text-white border border-white/10 focus:ring-white/20"
                          : "bg-black/5 text-black border border-black/10 focus:ring-black/20"
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
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>Data Collection Fields</h3>
                  <button onClick={() => setIsAddingField(true)} className={cn("px-3 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-white/90")}>
                    Add Field
                  </button>
                </div>

                {/* New Field Form (Simplified) */}
                <AnimatePresence>
                  {isAddingField && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                      <div className={cn("p-4 rounded-lg space-y-3", isDark ? "bg-white/5" : "bg-black/5")}>
                        <input
                          placeholder="Field Name (e.g. Order Number)"
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-white/40"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setIsAddingField(false)} className="text-sm opacity-60 hover:opacity-100">Cancel</button>
                          <button onClick={handleAddField} className="text-sm font-bold opacity-80 hover:opacity-100">Save</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flat List */}
                <div className="divide-y divide-white/5">
                  {knowledgeBase.contextFields.map(field => (
                    <div key={field.id} className="py-4 flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>{field.name}</span>
                          {field.required && <span className="text-red-400 text-xs">*</span>}
                          <span className={cn("text-[10px] uppercase border px-1 rounded", isDark ? "text-white/60 border-white/20" : "text-black/60 border-black/20")}>{field.type}</span>
                        </div>
                        {field.description && <p className={cn("text-xs mt-1", isDark ? "text-white/50" : "text-black/50")}>{field.description}</p>}
                      </div>
                      <button onClick={() => removeContextField(field.id)} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Categories Tab - simplified list */}
            {activeTab === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Similar structure to fields but for categories */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>Call Categories</h3>
                  <button onClick={() => setIsAddingCategory(true)} className={cn("px-3 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-white/90")}>
                    Add Category
                  </button>
                </div>

                {/* New Category Form */}
                <AnimatePresence>
                  {isAddingCategory && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                      <div className={cn("p-4 rounded-lg space-y-3", isDark ? "bg-white/5" : "bg-black/5")}>
                        <input
                          placeholder="Category Name (e.g. Sales)"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-white/40 mb-2"
                        />
                        <input
                          placeholder="Description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none focus:border-white/40 text-sm opacity-80"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-60 mr-2">Color:</span>
                          {['blue', 'orange', 'red', 'green', 'purple', 'emerald'].map(color => (
                            <button
                              key={color}
                              onClick={() => setNewCategory({ ...newCategory, color })}
                              className={cn(
                                "w-5 h-5 rounded-full transition-transform hover:scale-110",
                                newCategory.color === color ? "ring-2 ring-white/50 scale-110" : "opacity-60"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setIsAddingCategory(false)} className="text-sm opacity-60 hover:opacity-100">Cancel</button>
                          <button onClick={handleAddCategory} className="text-sm font-bold opacity-80 hover:opacity-100">Save</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="divide-y divide-white/5">
                  {knowledgeBase.categories.map(cat => (
                    <div key={cat.id} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full")} style={{ backgroundColor: cat.color || 'gray' }} />
                        <div>
                          <p className={cn("font-medium", isDark ? "text-white" : "text-black")}>{cat.name}</p>
                          <p className="text-xs opacity-50">{cat.description}</p>
                        </div>
                      </div>
                      <button onClick={() => removeCategory(cat.id)} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rules Tab - simplified list */}
            {activeTab === 'rules' && (
              <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>Priority Rules</h3>
                  <button onClick={() => setIsAddingRule(true)} className={cn("px-3 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-white/90")}>
                    Add Rule
                  </button>
                </div>
                {isAddingRule && (
                  <div className={cn("p-4 rounded-lg space-y-3", isDark ? "bg-white/5" : "bg-black/5")}>
                    <input value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="e.g. Mark as HIGH if user mentions 'cancel'" className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none" />
                    <button onClick={handleAddRule} className="text-sm font-bold">Save</button>
                  </div>
                )}
                <div className="divide-y divide-white/5">
                  {knowledgeBase.priorityRules.map((rule, i) => (
                    <div key={i} className="py-4 flex items-start gap-3 group">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                      <p className={cn("flex-1 text-sm", isDark ? "text-white/80" : "text-black/80")}>{rule}</p>
                      <button onClick={() => handleRemoveRule(i)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Instructions Tab - simplified list */}
            {activeTab === 'instructions' && (
              <motion.div key="instructions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>Custom Instructions</h3>
                  <button onClick={() => setIsAddingInstruction(true)} className={cn("px-3 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-white/90")}>
                    Add Inst.
                  </button>
                </div>
                {isAddingInstruction && (
                  <div className={cn("p-4 rounded-lg space-y-3", isDark ? "bg-white/5" : "bg-black/5")}>
                    <input value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)} placeholder="e.g. Always ask for email confirmation" className="w-full bg-transparent border-b border-white/10 pb-2 focus:outline-none" />
                    <button onClick={handleAddInstruction} className="text-sm font-bold">Save</button>
                  </div>
                )}
                <div className="divide-y divide-white/5">
                  {knowledgeBase.customInstructions.map((inst, i) => (
                    <div key={i} className="py-4 flex items-start gap-3 group">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">{i + 1}</span>
                      <p className={cn("flex-1 text-sm", isDark ? "text-white/80" : "text-black/80")}>{inst}</p>
                      <button onClick={() => handleRemoveInstruction(i)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
