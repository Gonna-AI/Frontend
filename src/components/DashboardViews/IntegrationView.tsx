import React, { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import {
  Copy,
  Check,
  Link,
  Code,
  Phone,
  MessageSquare,
  ExternalLink,
  Globe,
  Bot,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDemoCall } from "../../contexts/DemoCallContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function IntegrationView({
  isDark = true,
}: {
  isDark?: boolean;
}) {
  const { user } = useAuth();
  const { knowledgeBase } = useDemoCall();
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const agentId = user?.id || "";

  // Build the base URL from the current window location
  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}`;
  }, []);

  const chatLink = `${baseUrl}/user/chat?agentId=${agentId}`;
  const callLink = `${baseUrl}/user/call?agentId=${agentId}`;

  const embedSnippet = `<iframe
  src="${chatLink}&embed=true"
  width="400"
  height="600"
  style="border: none; border-radius: 12px;"
  allow="microphone"
></iframe>`;

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ fieldId, text }: { fieldId: string; text: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldId)}
      className={cn(
        "p-2 rounded-lg transition-all duration-200",
        copiedField === fieldId
          ? "bg-green-500/20 text-green-400"
          : isDark
            ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            : "bg-black/5 hover:bg-black/10 text-black/60 hover:text-black",
      )}
    >
      {copiedField === fieldId ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p
          className={cn("text-sm", isDark ? "text-white/50" : "text-gray-500")}
        >
          {t("integration.loginRequired")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2
          className={cn(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {t("integration.title")}
        </h2>
        <p
          className={cn(
            "mt-1 text-sm",
            isDark ? "text-white/50" : "text-gray-500",
          )}
        >
          {t("integration.subtitle")}
        </p>
      </div>

      {/* Agent ID Card */}
      <div
        className={cn(
          "rounded-xl border p-5",
          isDark
            ? "bg-white/[0.02] border-white/10"
            : "bg-white border-black/10",
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-purple-500/10" : "bg-purple-50",
            )}
          >
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("integration.agentIdTitle")}
            </h3>
            <p
              className={cn(
                "text-xs",
                isDark ? "text-white/40" : "text-gray-400",
              )}
            >
              {t("integration.agentIdDesc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code
            className={cn(
              "flex-1 px-3 py-2.5 rounded-lg text-sm font-mono truncate",
              isDark
                ? "bg-black/40 text-white/80 border border-white/5"
                : "bg-gray-50 text-gray-700 border border-gray-200",
            )}
          >
            {agentId}
          </code>
          <CopyButton fieldId="agent-id" text={agentId} />
        </div>
      </div>

      {/* Active Persona Card */}
      <div
        className={cn(
          "rounded-xl border p-5",
          isDark
            ? "bg-white/[0.02] border-white/10"
            : "bg-white border-black/10",
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "p-2 rounded-lg",
              isDark
                ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                : "bg-gradient-to-br from-purple-50 to-blue-50",
            )}
          >
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("integration.personaTitle")}
            </h3>
            <p
              className={cn(
                "text-xs",
                isDark ? "text-white/40" : "text-gray-400",
              )}
            >
              {t("integration.personaDesc")}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span
              className={cn(
                "text-xs font-medium",
                isDark ? "text-white/40" : "text-gray-400",
              )}
            >
              {t("integration.personaLabel")}
            </span>
            <p
              className={cn(
                "text-sm mt-0.5",
                isDark ? "text-white/80" : "text-gray-700",
              )}
            >
              {knowledgeBase.persona || t("integration.personaDefault")}
            </p>
          </div>
          <div>
            <span
              className={cn(
                "text-xs font-medium",
                isDark ? "text-white/40" : "text-gray-400",
              )}
            >
              {t("integration.greetingLabel")}
            </span>
            <p
              className={cn(
                "text-sm mt-0.5 italic",
                isDark ? "text-white/60" : "text-gray-500",
              )}
            >
              "{knowledgeBase.greeting || t("integration.greetingDefault")}"
            </p>
          </div>
          {knowledgeBase.selectedVoiceId && (
            <div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {t("integration.voiceLabel")}
              </span>
              <p
                className={cn(
                  "text-sm mt-0.5",
                  isDark ? "text-white/80" : "text-gray-700",
                )}
              >
                {knowledgeBase.selectedVoiceId}
              </p>
            </div>
          )}
          {knowledgeBase.categories && knowledgeBase.categories.length > 0 && (
            <div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {t("integration.categoriesLabel")}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {knowledgeBase.categories.slice(0, 6).map((cat) => (
                  <span
                    key={cat.id}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[11px] font-medium border",
                      isDark
                        ? "bg-white/5 border-white/10 text-white/60"
                        : "bg-gray-50 border-gray-200 text-gray-600",
                    )}
                  >
                    {cat.name}
                  </span>
                ))}
                {knowledgeBase.categories.length > 6 && (
                  <span
                    className={cn(
                      "text-[11px]",
                      isDark ? "text-white/30" : "text-gray-400",
                    )}
                  >
                    {t("integration.moreCount").replace(
                      "{count}",
                      (knowledgeBase.categories.length - 6).toString(),
                    )}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chat Link */}
        <div
          className={cn(
            "rounded-xl border p-5",
            isDark
              ? "bg-white/[0.02] border-white/10"
              : "bg-white border-black/10",
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-blue-500/10" : "bg-blue-50",
              )}
            >
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("integration.chatLinkTitle")}
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {t("integration.chatLinkDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex-1 px-3 py-2.5 rounded-lg text-xs font-mono truncate",
                isDark
                  ? "bg-black/40 text-white/60 border border-white/5"
                  : "bg-gray-50 text-gray-500 border border-gray-200",
              )}
            >
              {chatLink}
            </div>
            <CopyButton fieldId="chat-link" text={chatLink} />
          </div>
          <div className="flex gap-2 mt-3">
            <a
              href={chatLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
                isDark
                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100",
              )}
            >
              <ExternalLink className="w-3 h-3" />
              {t("integration.openAction")}
            </a>
          </div>
        </div>

        {/* Call Link */}
        <div
          className={cn(
            "rounded-xl border p-5",
            isDark
              ? "bg-white/[0.02] border-white/10"
              : "bg-white border-black/10",
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-green-500/10" : "bg-green-50",
              )}
            >
              <Phone className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("integration.callLinkTitle")}
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {t("integration.callLinkDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex-1 px-3 py-2.5 rounded-lg text-xs font-mono truncate",
                isDark
                  ? "bg-black/40 text-white/60 border border-white/5"
                  : "bg-gray-50 text-gray-500 border border-gray-200",
              )}
            >
              {callLink}
            </div>
            <CopyButton fieldId="call-link" text={callLink} />
          </div>
          <div className="flex gap-2 mt-3">
            <a
              href={callLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
                isDark
                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "bg-green-50 text-green-600 hover:bg-green-100",
              )}
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div
        className={cn(
          "rounded-xl border p-5",
          isDark
            ? "bg-white/[0.02] border-white/10"
            : "bg-white border-black/10",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-orange-500/10" : "bg-orange-50",
              )}
            >
              <Code className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("integration.embedTitle")}
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-white/40" : "text-gray-400",
                )}
              >
                {t("integration.embedDesc")}
              </p>
            </div>
          </div>
          <CopyButton fieldId="embed-code" text={embedSnippet} />
        </div>
        <pre
          className={cn(
            "px-4 py-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre",
            isDark
              ? "bg-black/40 text-white/60 border border-white/5"
              : "bg-gray-50 text-gray-600 border border-gray-200",
          )}
        >
          {embedSnippet}
        </pre>
      </div>

      {/* Info Note */}
      <div
        className={cn(
          "rounded-xl border p-4 flex items-start gap-3",
          isDark
            ? "bg-blue-500/5 border-blue-500/10"
            : "bg-blue-50 border-blue-100",
        )}
      >
        <Link
          className={cn(
            "w-4 h-4 mt-0.5 shrink-0",
            isDark ? "text-blue-400" : "text-blue-500",
          )}
        />
        <p
          className={cn(
            "text-xs leading-relaxed",
            isDark ? "text-blue-300/80" : "text-blue-700",
          )}
        >
          {t("integration.infoNote")}
        </p>
      </div>
    </div>
  );
}
