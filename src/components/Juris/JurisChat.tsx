import { JurisMessage, SearchMode, CaseResult } from "../../types/juris";
import { useState } from "react";
import JurisCaseCard from "./JurisCaseCard";
import DeepSearchReasoning from "./DeepSearchReasoning";
import { Sparkles, Search, Brain } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface JurisChatProps {
  mode: SearchMode;
  messages: JurisMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onModeChange: (mode: SearchMode) => void;
  showReasoning?: boolean;
  pendingQuery?: string;
  onReasoningComplete?: () => void;
}

// Sample cases for quick access
// Sample cases for quick access
const NORMAL_SAMPLES = [
  {
    query:
      "I accidentally hit a pedestrian at night while driving home, what are the legal consequences?",
    icon: "🚗",
  },
  {
    query:
      "My landlord is refusing to return my security deposit after I moved out, claiming damages I didn't cause.",
    icon: "🏠",
  },
  {
    query:
      "I bought a defective laptop online and the seller refuses to refund or replace it.",
    icon: "💻",
  },
];

const DEEP_SAMPLES = [
  {
    query:
      "I am representing a client accused in a dowry death case under Section 304B. I need a comprehensive analysis of recent Supreme Court judgments regarding the presumption of guilt and rebuttal standards, specifically focusing on the 'soon before death' interpretation.",
    icon: "⚖️",
  },
  {
    query:
      "Analyze the constitutional validity of the latest IT Rules amendment regarding intermediary liability, focusing on freedom of speech implications under Article 19(1)(a) and recent High Court precedents on safe harbor provisions.",
    icon: "📜",
  },
  {
    query:
      "Prepare a detailed legal strategy for a corporate insolvency resolution process where the operational creditor's claim is disputed. Cite relevant NCLT and NCLAT rulings on 'pre-existing dispute' under the IBC code.",
    icon: "🏢",
  },
];

export default function JurisChat({
  mode,
  messages,
  onSendMessage,
  onClearChat,
  onModeChange,
  showReasoning = false,
  pendingQuery = "",
  onReasoningComplete = () => {},
}: JurisChatProps) {
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [showCaseConnection, setShowCaseConnection] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    if (message.trim()) {
      onSendMessage(message.trim());
      setShowExamples(false);
      e.currentTarget.reset();
    }
  };

  const handleSampleCaseClick = (query: string) => {
    onSendMessage(query);
    setShowExamples(false);
  };

  const handleCaseClick = (caseData: CaseResult) => {
    setSelectedCase(caseData);
    setShowCaseConnection(true);
  };

  const handleModeChange = (newMode: SearchMode) => {
    if (newMode !== mode) {
      onModeChange(newMode);
      onClearChat();
      setShowExamples(true);
    }
  };

  const modeConfig = {
    normal: {
      description: t("juris.descNormal"),
      placeholder: t("juris.placeholderNormal"),
      detail: t("juris.detailNormal"),
    },
    deep_research: {
      description: t("juris.descDeep"),
      placeholder: t("juris.placeholderDeep"),
      detail: t("juris.detailDeep"),
    },
  };

  const config = modeConfig[mode];

  return (
    <>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar mb-4">
        {/* Case Connection View */}
        {showCaseConnection && selectedCase && (
          <div className="mb-6 p-6 bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">
                {t("juris.caseConnection")}
              </h3>
              <button
                onClick={() => setShowCaseConnection(false)}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {t("juris.close")} ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">
                  {t("juris.selectedCase")}
                </h4>
                <p className="text-sm text-purple-200">{selectedCase.title}</p>
                <p className="text-xs text-white/50 mt-1">
                  {selectedCase.citation}
                </p>
              </div>
              <div className="pt-4 border-t border-purple-500/20">
                <h4 className="text-sm font-semibold text-white/80 mb-3">
                  {t("juris.connectsToQuery")}
                </h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>
                      <strong className="text-purple-300">
                        {t("juris.legalConcepts")}
                      </strong>{" "}
                      Shares core principles on{" "}
                      {selectedCase.metadata.jurisdiction.toLowerCase()}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>
                      <strong className="text-purple-300">
                        {t("juris.precedentChain")}
                      </strong>{" "}
                      Cites {selectedCase.precedents.length} common precedents
                      with your query context
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>
                      <strong className="text-purple-300">
                        {t("juris.similarityScore")}
                      </strong>{" "}
                      {(selectedCase.similarityScore * 100).toFixed(0)}%
                      semantic match
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>
                      <strong className="text-purple-300">
                        {t("juris.citedStatutes")}
                      </strong>{" "}
                      References{" "}
                      {selectedCase.metadata.statutes_cited
                        .slice(0, 2)
                        .join(", ")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-3 max-w-md px-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white/80">
                {t("juris.retrievalTitle")}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {config.description}
              </p>
              <p className="text-xs text-white/40">{config.detail}</p>
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div key={idx}>
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Case Results */}
                  {message.caseResults && message.caseResults.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                          {t("juris.foundSimilar")} (
                          {message.caseResults.length})
                        </span>
                      </div>

                      <div className="grid gap-3">
                        {message.caseResults.map((caseData) => (
                          <JurisCaseCard
                            key={caseData.id}
                            caseData={caseData}
                            onClick={() => handleCaseClick(caseData)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  {message.analysis && (
                    <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">
                        {t("juris.aiAnalysis")}
                      </h4>
                      <div className="space-y-2 text-xs text-white/70">
                        <p>
                          <strong className="text-purple-200">
                            {t("juris.summary")}
                          </strong>{" "}
                          {message.analysis.similaritySummary}
                        </p>
                        <div>
                          <strong className="text-purple-200">
                            {t("juris.keyConcepts")}
                          </strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.analysis.keyLegalConcepts.map(
                              (concept, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-200"
                                >
                                  {concept}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deep Search Reasoning Timeline - Show after user message */}
              {message.role === "user" &&
                showReasoning &&
                pendingQuery &&
                idx === messages.length - 1 && (
                  <DeepSearchReasoning
                    query={pendingQuery}
                    onComplete={onReasoningComplete}
                  />
                )}
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/98 to-transparent pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Sample Cases - Only show if no messages and showExamples is true */}
          {showExamples && messages.length === 0 && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs text-white/40 mb-2 text-center">
                {t("juris.tryExamples")}
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {(mode === "deep_research" ? DEEP_SAMPLES : NORMAL_SAMPLES).map(
                  (sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSampleCaseClick(sample.query)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-lg sm:rounded-xl text-xs text-white/70 hover:text-purple-300 transition-all duration-300 backdrop-blur-sm group max-w-[90%] sm:max-w-none text-left sm:text-center"
                    >
                      <span className="mr-1 sm:mr-2">{sample.icon}</span>
                      <span className="hidden sm:inline">
                        {sample.query.length > 60
                          ? sample.query.substring(0, 60) + "..."
                          : sample.query}
                      </span>
                      <span className="sm:hidden">
                        {sample.query.length > 30
                          ? sample.query.substring(0, 30) + "..."
                          : sample.query}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Input Form with Mode Toggle Inside */}
          <form onSubmit={handleSubmit} className="relative">
            <div
              className={`flex gap-0 items-center bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl transition-all backdrop-blur-sm overflow-hidden ${messages.length > 0 ? "opacity-50 cursor-not-allowed" : "hover:border-white/20"}`}
            >
              <input
                type="text"
                name="message"
                placeholder={
                  messages.length > 0
                    ? t("juris.placeholderClear")
                    : config.placeholder
                }
                className="flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-transparent text-white placeholder-white/40 focus:outline-none disabled:cursor-not-allowed"
                autoComplete="off"
                disabled={messages.length > 0}
              />

              {/* Mode Toggle Inside Input */}
              <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3">
                <div
                  className={`p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 inline-flex ${messages.length > 0 ? "opacity-50" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      !messages.length && handleModeChange("normal")
                    }
                    disabled={messages.length > 0}
                    className={`px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      mode === "normal"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-white/50 hover:text-white/70"
                    } ${messages.length > 0 ? "cursor-not-allowed" : ""}`}
                    title={t("juris.modeNormal")}
                  >
                    <Search className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">
                      {t("juris.modeNormal")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      !messages.length && handleModeChange("deep_research")
                    }
                    disabled={messages.length > 0}
                    className={`px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      mode === "deep_research"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "text-white/50 hover:text-white/70"
                    } ${messages.length > 0 ? "cursor-not-allowed" : ""}`}
                    title={t("juris.modeDeep")}
                  >
                    <Brain className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">
                      {t("juris.modeDeep")}
                    </span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={messages.length > 0}
                  className={`p-2 sm:p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-lg sm:rounded-xl text-purple-300 transition-all duration-300 ${messages.length > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-500/30 hover:border-purple-500/50 hover:text-purple-200"}`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
