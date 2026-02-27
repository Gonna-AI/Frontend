import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Upload,
  Sparkles,
  Bot,
  User,
  Rocket,
  Edit3,
  CheckCircle,
  FileText,
  X,
  Loader2,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useDemoCall, KnowledgeBaseConfig } from "@/contexts/DemoCallContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/config/supabase";
import { ragService } from "@/services/ragService";

interface OnboardingWizardProps {
  isDark?: boolean;
  onComplete?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UploadedDoc {
  name: string;
  text: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function OnboardingWizard({
  isDark = true,
  onComplete,
}: OnboardingWizardProps) {
  const { t } = useLanguage();
  const { knowledgeBase, updateKnowledgeBase, saveKnowledgeBase } =
    useDemoCall();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [generatedConfig, setGeneratedConfig] =
    useState<Partial<KnowledgeBaseConfig> | null>(null);
  const [readyToDeploy, setReadyToDeploy] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start the conversation
  const startConversation = useCallback(async () => {
    setShowIntro(false);
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/api-onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [],
            mode: "chat",
          }),
        },
      );

      const data = await response.json();
      if (data.message) {
        setMessages([
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: t("onboarding.welcome"),
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [t]);

  // Send a message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/api-onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode: "chat",
            ...(uploadedDoc ? { documentText: uploadedDoc.text } : {}),
          }),
        },
      );

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      }

      if (data.readyToDeploy) {
        setReadyToDeploy(true);
        // Auto-generate the config
        generateConfig(newMessages);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble processing that. Could you try again?",
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(false);
  }, [input, messages, isLoading, uploadedDoc]);

  // Generate the final config
  const generateConfig = useCallback(
    async (conversationMessages: ChatMessage[]) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/api-onboarding`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              messages: conversationMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              mode: "generate",
              ...(uploadedDoc ? { documentText: uploadedDoc.text } : {}),
            }),
          },
        );

        const data = await response.json();
        if (data.type === "config" && data.config) {
          setGeneratedConfig(data.config);
        }
      } catch (err) {
        console.error("Config generation error:", err);
      }
    },
    [uploadedDoc],
  );

  // Deploy the config
  const deployConfig = useCallback(async () => {
    if (!generatedConfig) return;
    setIsDeploying(true);

    try {
      // Build the full merged config BEFORE saving
      // This avoids the race condition where updateKnowledgeBase (setState)
      // hasn't flushed yet when saveKnowledgeBase reads from its closure
      updateKnowledgeBase(generatedConfig);

      // Merge generated config with current knowledgeBase to create full config
      const fullConfig = {
        ...knowledgeBase,
        ...generatedConfig,
      } as KnowledgeBaseConfig;

      const success = await saveKnowledgeBase(fullConfig);
      if (success) {
        if (uploadedDoc && uploadedDoc.text) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const kbId = fullConfig.id || session?.user.id;
            if (kbId) {
              setIsDeploying(true); // Keep UI showing deploying
              const chunks = ragService.chunkText(uploadedDoc.text, 500); // 500 words per chunk roughly

              // To avoid rate-limiting or freezing, process them sequentially
              for (const chunk of chunks) {
                await ragService.storeDocument(kbId, chunk, {
                  source: uploadedDoc.name,
                });
              }
              console.log(
                `✅ Stored ${chunks.length} vectorized chunks for RAG.`,
              );
            }
          } catch (e) {
            console.error("Failed to embed document:", e);
          }
        }

        setDeployed(true);
        setTimeout(() => {
          onComplete?.();
        }, 2500);
      }
    } catch (err) {
      console.error("Deploy error:", err);
    }

    setIsDeploying(false);
  }, [
    generatedConfig,
    knowledgeBase,
    updateKnowledgeBase,
    saveKnowledgeBase,
    onComplete,
  ]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        const text = await file.text();
        setUploadedDoc({ name: file.name, text: text.substring(0, 15000) });

        // Add a system message about the upload
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-upload-${Date.now()}`,
            role: "user",
            content: `📎 Uploaded: ${file.name}`,
            timestamp: new Date(),
          },
        ]);

        // Send a follow-up to get the AI to acknowledge
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const allMessages = [
          ...messages,
          {
            role: "user" as const,
            content: `I've uploaded a document called "${file.name}". Please review it and use the information to configure my AI receptionist.`,
          },
        ];

        setIsLoading(true);
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/api-onboarding`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              messages: allMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              mode: "chat",
              documentText: text.substring(0, 15000),
            }),
          },
        );

        const data = await response.json();
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: data.message,
              timestamp: new Date(),
            },
          ]);
        }
        if (data.readyToDeploy) {
          setReadyToDeploy(true);
          generateConfig(allMessages as ChatMessage[]);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Upload error:", err);
      }

      setIsUploading(false);
    },
    [messages, generateConfig],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Styles
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/60" : "text-gray-500";
  const textMuted = isDark ? "text-white/40" : "text-gray-400";

  // --- Main Layout matching Dashboard standards ---
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {t("onboarding.title")}
          </h1>
          <p className={cn("text-sm mt-1", textSecondary)}>
            {t("onboarding.introDesc")}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div
        className={cn(
          "flex flex-col rounded-xl border h-[650px] overflow-hidden relative",
          isDark
            ? "bg-[#09090B] border-white/10 text-white"
            : "bg-white border-black/10 text-black",
        )}
      >
        {showIntro ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto w-full h-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg w-full text-center"
            >
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-8 relative"
              >
                <div
                  className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border shadow-lg relative z-20",
                    isDark
                      ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 shadow-purple-500/10"
                      : "bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200 shadow-purple-200/30",
                  )}
                >
                  <Wand2
                    className={cn(
                      "w-10 h-10",
                      isDark ? "text-purple-400" : "text-purple-600",
                    )}
                  />
                </div>
                <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full z-10" />
              </motion.div>

              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight mb-3",
                  textPrimary,
                )}
              >
                {t("onboarding.title")}
              </h2>
              <p className={cn("text-lg mb-10 leading-relaxed", textSecondary)}>
                {t("onboarding.introDesc")}
              </p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={startConversation}
                className={cn(
                  "relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 cursor-pointer overflow-hidden",
                  "backdrop-blur-xl border",
                  isDark
                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-lg shadow-black/20 hover:shadow-white/10"
                    : "bg-black/5 hover:bg-black/10 border-black/10 text-black shadow-lg shadow-black/5 hover:shadow-black/10",
                  "hover:scale-[1.02] active:scale-[0.98]",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="relative z-10">
                  {t("onboarding.startButton")}
                </span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </motion.button>
            </motion.div>
          </div>
        ) : deployed ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 w-full h-full relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-20",
                  "bg-gradient-to-br from-emerald-500 to-green-500 shadow-xl shadow-emerald-500/30",
                )}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className={cn("text-2xl font-bold mb-2", textPrimary)}>
                {t("onboarding.success")}
              </h2>
              <p className={textSecondary}>{t("onboarding.successDesc")}</p>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-transparent relative z-10">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide max-w-4xl mx-auto w-full">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                          isDark
                            ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30"
                            : "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200",
                        )}
                      >
                        <Bot
                          className={cn(
                            "w-4 h-4",
                            isDark ? "text-purple-400" : "text-purple-600",
                          )}
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? cn(
                              "rounded-br-md shadow-md",
                              "bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white border border-blue-400/20 shadow-blue-500/20",
                            )
                          : cn(
                              "rounded-bl-md border shadow-sm",
                              isDark
                                ? "bg-[#121214] border-white/10 text-white/90"
                                : "bg-white border-gray-200 text-gray-800",
                            ),
                      )}
                    >
                      {msg.content.startsWith("📎") ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{msg.content}</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                          isDark
                            ? "bg-white/10 border border-white/10"
                            : "bg-gray-100 border border-gray-200",
                        )}
                      >
                        <User
                          className={cn(
                            "w-4 h-4",
                            isDark ? "text-white/60" : "text-gray-600",
                          )}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                      isDark
                        ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30"
                        : "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200",
                    )}
                  >
                    <Bot
                      className={cn(
                        "w-4 h-4",
                        isDark ? "text-purple-400" : "text-purple-600",
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl rounded-bl-md px-5 py-3.5 border shadow-sm",
                      isDark
                        ? "bg-[#121214] border-white/10"
                        : "bg-white border-gray-200",
                    )}
                  >
                    <div className="flex gap-1.5 mt-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            delay: i * 0.15,
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDark ? "bg-purple-400/60" : "bg-purple-500/50",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Config Preview Card */}
            {generatedConfig && readyToDeploy && !deployed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mx-6 mb-4 rounded-xl border p-5 overflow-hidden max-w-4xl self-center w-full shadow-lg shadow-black/5",
                  isDark
                    ? "bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20"
                    : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200",
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={cn(
                        "w-5 h-5",
                        isDark ? "text-purple-400" : "text-purple-600",
                      )}
                    />
                    <h3 className={cn("font-bold text-base", textPrimary)}>
                      {t("onboarding.configReady")}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {generatedConfig.persona && (
                    <div>
                      <span className={cn("font-medium", textSecondary)}>
                        Persona:{" "}
                      </span>
                      <span className={textPrimary}>
                        {generatedConfig.persona}
                      </span>
                    </div>
                  )}
                  {generatedConfig.greeting && (
                    <div>
                      <span className={cn("font-medium", textSecondary)}>
                        Greeting:{" "}
                      </span>
                      <span className={textPrimary}>
                        "{generatedConfig.greeting}"
                      </span>
                    </div>
                  )}
                  {generatedConfig.contextFields &&
                    generatedConfig.contextFields.length > 0 && (
                      <div>
                        <span className={cn("font-medium", textSecondary)}>
                          Fields:{" "}
                        </span>
                        <span className={textPrimary}>
                          {generatedConfig.contextFields
                            .map((f) => f.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  {generatedConfig.categories &&
                    generatedConfig.categories.length > 0 && (
                      <div>
                        <span className={cn("font-medium", textSecondary)}>
                          Categories:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {generatedConfig.categories.map((cat, i) => (
                            <span
                              key={i}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-[11px] font-medium border",
                                isDark
                                  ? "bg-white/5 border-white/10 text-white/80"
                                  : "bg-white border-gray-200 text-gray-700",
                              )}
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {generatedConfig.priorityRules &&
                    generatedConfig.priorityRules.length > 0 && (
                      <div>
                        <span className={cn("font-medium", textSecondary)}>
                          Priority Rules:{" "}
                        </span>
                        <span className={textPrimary}>
                          {generatedConfig.priorityRules.length} rules
                          configured
                        </span>
                      </div>
                    )}
                </div>

                {/* Deploy / Edit buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={deployConfig}
                    disabled={isDeploying}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md",
                      "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/20",
                      "hover:from-emerald-500 hover:to-green-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5",
                      isDeploying && "opacity-70 pointer-events-none",
                    )}
                  >
                    {isDeploying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    {isDeploying
                      ? t("onboarding.deploying")
                      : t("onboarding.deploy")}
                  </button>
                  <button
                    onClick={() => {
                      setReadyToDeploy(false);
                      setGeneratedConfig(null);
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border shadow-sm",
                      isDark
                        ? "bg-[#1A1A1D] border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                        : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <Edit3 className="w-4 h-4" />
                    {t("onboarding.edit")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Uploaded document badge */}
            {uploadedDoc && (
              <div
                className={cn(
                  "max-w-4xl self-center w-[calc(100%-3rem)] mx-6 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs shadow-sm",
                  isDark
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-blue-50 border-blue-200 text-blue-600",
                )}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium truncate">{uploadedDoc.name}</span>
                <button
                  onClick={() => setUploadedDoc(null)}
                  className="ml-auto p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div
              className={cn(
                "p-4 border-t flex-shrink-0 z-20",
                isDark
                  ? "bg-[#0A0A0A] border-white/10"
                  : "bg-gray-50 border-black/10",
              )}
            >
              <div
                className={cn(
                  "flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all duration-200 max-w-4xl mx-auto w-full shadow-sm",
                  "focus-within:ring-2 focus-within:ring-offset-0",
                  isDark
                    ? "bg-[#121214] border-white/10 focus-within:border-purple-500/50 focus-within:ring-purple-500/20"
                    : "bg-white border-gray-200 focus-within:border-purple-400 focus-within:ring-purple-500/10",
                )}
              >
                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Upload Document"
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer",
                    isDark
                      ? "text-white/40 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.md,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("onboarding.placeholder")}
                  rows={1}
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed py-1.5",
                    "placeholder:opacity-50 max-h-32",
                    textPrimary,
                  )}
                  style={{ minHeight: "36px" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "36px";
                    el.style.height = Math.min(el.scrollHeight, 128) + "px";
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  title="Send Message"
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                      : cn(
                          isDark
                            ? "text-white/20 bg-white/5"
                            : "text-gray-300 bg-gray-100",
                        ),
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <p className={cn("text-[11px] text-center mt-3", textMuted)}>
                {t("onboarding.poweredBy")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
