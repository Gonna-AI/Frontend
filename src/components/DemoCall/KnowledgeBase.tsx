import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Settings, 
  Tag,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Mic,
  Loader2,
  Check,
  Zap,
  Cloud,
  CloudOff,
  Monitor
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDemoCall, ContextField, CallCategory } from '../../contexts/DemoCallContext';
import VoiceSelector from './VoiceSelector';
import { aiService } from '../../services/aiService';
import { testGeminiConnection } from '../../services/geminiService';
import { localLLMService } from '../../services/localLLMService';

interface KnowledgeBaseProps {
  isDark?: boolean;
}

type ActiveTab = 'prompt' | 'voice' | 'fields' | 'categories' | 'rules' | 'instructions';

export default function KnowledgeBase({ isDark = true }: KnowledgeBaseProps) {
  const { 
    knowledgeBase, 
    updateKnowledgeBase,
    saveKnowledgeBase,
    addContextField, 
    updateContextField, 
    removeContextField,
    addCategory,
    removeCategory 
  } = useDemoCall();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('prompt');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  
  // Form states
  const [newField, setNewField] = useState<Partial<ContextField>>({
    name: '',
    description: '',
    required: false,
    type: 'text',
  });
  const [newCategory, setNewCategory] = useState({ name: '', color: 'blue', description: '' });
  const [newRule, setNewRule] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  
  // AI and Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);
  const [localLLMConnected, setLocalLLMConnected] = useState<boolean | null>(null);
  const [localLLMModel, setLocalLLMModel] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Update AI service when knowledge base changes
  useEffect(() => {
    aiService.setKnowledgeBase(knowledgeBase);
  }, [knowledgeBase]);

  // Test Gemini and Local LLM connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Test Gemini
      const gemini = await testGeminiConnection();
      setGeminiConnected(gemini);
      
      // Test Local LLM (Ollama)
      const localAvailable = await localLLMService.initialize();
      setLocalLLMConnected(localAvailable);
      if (localAvailable) {
        setLocalLLMModel(localLLMService.getServiceUrl());
      }
    } catch (error) {
      setGeminiConnected(false);
      setLocalLLMConnected(false);
    }
    setIsTestingConnection(false);
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
      // Use the context's save method which handles both Supabase and localStorage
      const success = await saveKnowledgeBase();

      if (success) {
        // Update AI service with latest config
        aiService.setKnowledgeBase(knowledgeBase);
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsSaving(false);
  };

  const tabs = [
    { id: 'prompt' as const, label: 'System Prompt', icon: Brain },
    { id: 'voice' as const, label: 'AI Voice', icon: Mic },
    { id: 'fields' as const, label: 'Context Fields', icon: Tag },
    { id: 'categories' as const, label: 'Categories', icon: BookOpen },
    { id: 'rules' as const, label: 'Priority Rules', icon: AlertTriangle },
    { id: 'instructions' as const, label: 'Instructions', icon: Settings },
  ];

  const colors = ['blue', 'purple', 'green', 'orange', 'red', 'emerald', 'pink', 'yellow', 'cyan', 'indigo'];

  const handleAddField = () => {
    if (newField.name) {
      addContextField({
        id: `field-${Date.now()}`,
        name: newField.name,
        description: newField.description || '',
        required: newField.required || false,
        type: newField.type || 'text',
        options: newField.options,
      });
      setNewField({ name: '', description: '', required: false, type: 'text' });
      setIsAddingField(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      addCategory({
        id: `cat-${Date.now()}`,
        ...newCategory,
      });
      setNewCategory({ name: '', color: 'blue', description: '' });
      setIsAddingCategory(false);
    }
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      updateKnowledgeBase({
        priorityRules: [...knowledgeBase.priorityRules, newRule.trim()],
      });
      setNewRule('');
      setIsAddingRule(false);
    }
  };

  const handleRemoveRule = (index: number) => {
    updateKnowledgeBase({
      priorityRules: knowledgeBase.priorityRules.filter((_, i) => i !== index),
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      updateKnowledgeBase({
        customInstructions: [...knowledgeBase.customInstructions, newInstruction.trim()],
      });
      setNewInstruction('');
      setIsAddingInstruction(false);
    }
  };

  const handleRemoveInstruction = (index: number) => {
    updateKnowledgeBase({
      customInstructions: knowledgeBase.customInstructions.filter((_, i) => i !== index),
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={cn(
      "rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/80 border border-black/10"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 border-b",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0",
            isDark 
              ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10" 
              : "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-black/10"
          )}>
            <Sparkles className={cn(
              "w-4 h-4 md:w-5 md:h-5",
              isDark ? "text-purple-400" : "text-purple-600"
            )} />
          </div>
          <div className="min-w-0">
            <h3 className={cn(
              "font-semibold text-sm md:text-base",
              isDark ? "text-white" : "text-black"
            )}>
              Knowledge Base
            </h3>
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-[10px] md:text-xs truncate",
                isDark ? "text-white/50" : "text-black/50"
              )}>
                Configure AI behavior
              </p>
              {/* AI Status Badges */}
              <div className="flex items-center gap-1">
                {/* Gemini Status */}
                <button 
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  title={geminiConnected ? 'Gemini Cloud Connected' : 'Gemini Offline'}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
                    isTestingConnection
                      ? isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"
                      : geminiConnected
                        ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-500/10 text-green-600"
                        : isDark ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-600"
                  )}
                >
                  {isTestingConnection ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : geminiConnected ? (
                    <Cloud className="w-2.5 h-2.5" />
                  ) : (
                    <CloudOff className="w-2.5 h-2.5" />
                  )}
                  <span className="hidden sm:inline">
                    {geminiConnected ? 'Gemini' : 'Cloud'}
                  </span>
                </button>

                {/* Local LLM Status */}
                <div 
                  title={localLLMConnected ? `Local: ${localLLMModel}` : 'Ollama not running'}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                    localLLMConnected
                      ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/10 text-blue-600"
                      : isDark ? "bg-white/10 text-white/30" : "bg-black/10 text-black/30"
                  )}
                >
                  <Monitor className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">
                    {localLLMConnected ? 'Local' : 'Local'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveToSupabase}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            saveSuccess
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : isDark 
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30" 
                : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {saveSuccess ? 'Saved!' : 'Save Config'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className={cn(
        "flex gap-1 p-1.5 md:p-2 overflow-x-auto border-b scrollbar-hide",
        isDark ? "border-white/10" : "border-black/10"
      )}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
              activeTab === tab.id
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/10 text-black"
                : isDark
                  ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                  : "text-black/50 hover:text-black/80 hover:bg-black/5"
            )}
          >
            <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {/* System Prompt Tab */}
          {activeTab === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* System Prompt */}
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium flex items-center gap-2",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  <Brain className="w-4 h-4" />
                  System Prompt
                </label>
                <textarea
                  value={knowledgeBase.systemPrompt}
                  onChange={(e) => updateKnowledgeBase({ systemPrompt: e.target.value })}
                  rows={8}
                  className={cn(
                    "w-full p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2",
                    isDark 
                      ? "bg-black/30 text-white border border-white/10 focus:ring-purple-500/50" 
                      : "bg-white text-black border border-black/10 focus:ring-purple-500/50"
                  )}
                  placeholder="Define the AI's core behavior and personality..."
                />
              </div>

              {/* Persona */}
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  AI Persona
                </label>
                <input
                  value={knowledgeBase.persona}
                  onChange={(e) => updateKnowledgeBase({ persona: e.target.value })}
                  className={cn(
                    "w-full p-3 rounded-xl text-sm focus:outline-none focus:ring-2",
                    isDark 
                      ? "bg-black/30 text-white border border-white/10 focus:ring-purple-500/50" 
                      : "bg-white text-black border border-black/10 focus:ring-purple-500/50"
                  )}
                  placeholder="e.g., Professional, empathetic, and efficient assistant"
                />
              </div>

              {/* Greeting */}
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium flex items-center gap-2",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  <MessageSquare className="w-4 h-4" />
                  Opening Greeting
                </label>
                <textarea
                  value={knowledgeBase.greeting}
                  onChange={(e) => updateKnowledgeBase({ greeting: e.target.value })}
                  rows={2}
                  className={cn(
                    "w-full p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2",
                    isDark 
                      ? "bg-black/30 text-white border border-white/10 focus:ring-purple-500/50" 
                      : "bg-white text-black border border-black/10 focus:ring-purple-500/50"
                  )}
                  placeholder="How the AI greets callers..."
                />
              </div>

              {/* Response Guidelines */}
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Response Guidelines
                </label>
                <textarea
                  value={knowledgeBase.responseGuidelines}
                  onChange={(e) => updateKnowledgeBase({ responseGuidelines: e.target.value })}
                  rows={5}
                  className={cn(
                    "w-full p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2",
                    isDark 
                      ? "bg-black/30 text-white border border-white/10 focus:ring-purple-500/50" 
                      : "bg-white text-black border border-black/10 focus:ring-purple-500/50"
                  )}
                  placeholder="Guidelines for how the AI should respond..."
                />
              </div>
            </motion.div>
          )}

          {/* AI Voice Tab */}
          {activeTab === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <VoiceSelector
                isDark={isDark}
                selectedVoiceId={knowledgeBase.selectedVoiceId}
                onVoiceSelect={(voiceId) => updateKnowledgeBase({ selectedVoiceId: voiceId })}
                onSave={async (voiceId) => {
                  // Save to local storage or backend
                  console.log('Saving voice selection:', voiceId);
                  updateKnowledgeBase({ selectedVoiceId: voiceId });
                }}
                compact
              />
            </motion.div>
          )}

          {/* Context Fields Tab */}
          {activeTab === 'fields' && (
            <motion.div
              key="fields"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Define fields the AI should extract from conversations
                </p>
                <button
                  onClick={() => setIsAddingField(true)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isDark 
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30" 
                      : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              {/* Add Field Form */}
              <AnimatePresence>
                {isAddingField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "rounded-lg md:rounded-xl p-3 md:p-4 space-y-2 md:space-y-3 overflow-hidden",
                      isDark 
                        ? "bg-blue-500/10 border border-blue-500/20" 
                        : "bg-blue-500/5 border border-blue-500/20"
                    )}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      <input
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        placeholder="Field name"
                        className={cn(
                          "p-2 rounded-md md:rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2",
                          isDark 
                            ? "bg-black/30 text-white border border-white/10 focus:ring-blue-500/50" 
                            : "bg-white text-black border border-black/10 focus:ring-blue-500/50"
                        )}
                      />
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as ContextField['type'] })}
                        className={cn(
                          "p-2 rounded-md md:rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2",
                          isDark 
                            ? "bg-black/30 text-white border border-white/10 focus:ring-blue-500/50" 
                            : "bg-white text-black border border-black/10 focus:ring-blue-500/50"
                        )}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                        <option value="select">Select</option>
                      </select>
                    </div>
                    <input
                      value={newField.description}
                      onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                      placeholder="Description (optional)"
                      className={cn(
                        "w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-black/30 text-white border border-white/10 focus:ring-blue-500/50" 
                          : "bg-white text-black border border-black/10 focus:ring-blue-500/50"
                      )}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="rounded"
                      />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/80" : "text-black/80"
                      )}>
                        Required field
                      </span>
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingField(false)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors",
                          isDark ? "text-white/60 hover:bg-white/10" : "text-black/60 hover:bg-black/10"
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddField}
                        disabled={!newField.name}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          newField.name
                            ? isDark 
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" 
                              : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Save className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fields List */}
              {knowledgeBase.contextFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  layout
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl transition-colors",
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border border-white/5" 
                      : "bg-black/5 hover:bg-black/10 border border-black/5"
                  )}
                >
                  <GripVertical className={cn(
                    "w-4 h-4 opacity-0 group-hover:opacity-50 cursor-grab",
                    isDark ? "text-white" : "text-black"
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium text-sm",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {field.name}
                      </span>
                      {field.required && (
                        <span className="text-xs text-red-400">*</span>
                      )}
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        isDark ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"
                      )}>
                        {field.type}
                      </span>
                    </div>
                    {field.description && (
                      <p className={cn(
                        "text-xs mt-0.5",
                        isDark ? "text-white/50" : "text-black/50"
                      )}>
                        {field.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeContextField(field.id)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      isDark 
                        ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10" 
                        : "text-red-600/60 hover:text-red-600 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Categories for call classification
                </p>
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isDark 
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30" 
                      : "bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {/* Add Category Form */}
              <AnimatePresence>
                {isAddingCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "rounded-xl p-4 space-y-3 overflow-hidden",
                      isDark 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : "bg-green-500/5 border border-green-500/20"
                    )}
                  >
                    <input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Category name"
                      className={cn(
                        "w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-black/30 text-white border border-white/10 focus:ring-green-500/50" 
                          : "bg-white text-black border border-black/10 focus:ring-green-500/50"
                      )}
                    />
                    <input
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Description"
                      className={cn(
                        "w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-black/30 text-white border border-white/10 focus:ring-green-500/50" 
                          : "bg-white text-black border border-black/10 focus:ring-green-500/50"
                      )}
                    />
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-transform",
                            newCategory.color === color ? "scale-110 border-white" : "border-transparent",
                            `bg-${color}-500`
                          )}
                          style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingCategory(false)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors",
                          isDark ? "text-white/60 hover:bg-white/10" : "text-black/60 hover:bg-black/10"
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCategory.name}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          newCategory.name
                            ? isDark 
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                              : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Save className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {knowledgeBase.categories.map(category => (
                  <div
                    key={category.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 md:p-3 rounded-lg md:rounded-xl border transition-colors",
                      getColorClasses(category.color)
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm">{category.name}</p>
                      {category.description && (
                        <p className="text-[10px] md:text-xs opacity-70 truncate">{category.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="p-1 rounded opacity-50 md:opacity-0 group-hover:opacity-100 hover:bg-black/20 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Priority Rules Tab */}
          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Rules for determining call priority
                </p>
                <button
                  onClick={() => setIsAddingRule(true)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isDark 
                      ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30" 
                      : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border border-orange-500/20"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              {/* Add Rule Form */}
              <AnimatePresence>
                {isAddingRule && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "rounded-xl p-4 space-y-3 overflow-hidden",
                      isDark 
                        ? "bg-orange-500/10 border border-orange-500/20" 
                        : "bg-orange-500/5 border border-orange-500/20"
                    )}
                  >
                    <textarea
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="e.g., Mark as HIGH if caller mentions deadline..."
                      rows={2}
                      className={cn(
                        "w-full p-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-black/30 text-white border border-white/10 focus:ring-orange-500/50" 
                          : "bg-white text-black border border-black/10 focus:ring-orange-500/50"
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingRule(false)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors",
                          isDark ? "text-white/60 hover:bg-white/10" : "text-black/60 hover:bg-black/10"
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddRule}
                        disabled={!newRule.trim()}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          newRule.trim()
                            ? isDark 
                              ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" 
                              : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rules List */}
              {knowledgeBase.priorityRules.map((rule, index) => (
                <motion.div
                  key={index}
                  layout
                  className={cn(
                    "group flex items-start gap-3 p-3 rounded-xl transition-colors",
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border border-white/5" 
                      : "bg-black/5 hover:bg-black/10 border border-black/5"
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    isDark ? "text-orange-400" : "text-orange-600"
                  )} />
                  <p className={cn(
                    "flex-1 text-sm",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {rule}
                  </p>
                  <button
                    onClick={() => handleRemoveRule(index)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      isDark 
                        ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10" 
                        : "text-red-600/60 hover:text-red-600 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <p className={cn(
                  "text-sm",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  Custom instructions for the AI
                </p>
                <button
                  onClick={() => setIsAddingInstruction(true)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isDark 
                      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30" 
                      : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/20"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Instruction
                </button>
              </div>

              {/* Add Instruction Form */}
              <AnimatePresence>
                {isAddingInstruction && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "rounded-xl p-4 space-y-3 overflow-hidden",
                      isDark 
                        ? "bg-purple-500/10 border border-purple-500/20" 
                        : "bg-purple-500/5 border border-purple-500/20"
                    )}
                  >
                    <textarea
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      placeholder="e.g., Always ask for callback number if issue unresolved..."
                      rows={2}
                      className={cn(
                        "w-full p-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-black/30 text-white border border-white/10 focus:ring-purple-500/50" 
                          : "bg-white text-black border border-black/10 focus:ring-purple-500/50"
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingInstruction(false)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors",
                          isDark ? "text-white/60 hover:bg-white/10" : "text-black/60 hover:bg-black/10"
                        )}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddInstruction}
                        disabled={!newInstruction.trim()}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          newInstruction.trim()
                            ? isDark 
                              ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                              : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions List */}
              {knowledgeBase.customInstructions.map((instruction, index) => (
                <motion.div
                  key={index}
                  layout
                  className={cn(
                    "group flex items-start gap-3 p-3 rounded-xl transition-colors",
                    isDark 
                      ? "bg-white/5 hover:bg-white/10 border border-white/5" 
                      : "bg-black/5 hover:bg-black/10 border border-black/5"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded flex items-center justify-center text-xs font-medium flex-shrink-0",
                    isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/10 text-purple-600"
                  )}>
                    {index + 1}
                  </span>
                  <p className={cn(
                    "flex-1 text-sm",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {instruction}
                  </p>
                  <button
                    onClick={() => handleRemoveInstruction(index)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      isDark 
                        ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10" 
                        : "text-red-600/60 hover:text-red-600 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={cn(
        "px-3 md:px-4 py-2 md:py-3 border-t",
        isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
      )}>
        <div className="flex items-center justify-center gap-2">
          <Zap className={cn(
            "w-3 h-3",
            geminiConnected || localLLMConnected
              ? isDark ? "text-green-400" : "text-green-600"
              : isDark ? "text-yellow-400" : "text-yellow-600"
          )} />
          <p className={cn(
            "text-[10px] md:text-xs text-center",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            {geminiConnected 
              ? `Gemini → ${localLLMConnected ? 'Local LLM →' : ''} Mock • Changes apply to next call`
              : localLLMConnected
                ? `Local LLM → Mock • Check cloudflare tunnel is running`
                : 'Using Smart Mock • Install Ollama for local AI fallback'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

