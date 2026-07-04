import { useCallback, useEffect, useRef, useState } from "react";

import {
  askCopilot,
  fetchChatMessages,
  fetchChatThreads,
  subscribeToTable,
  type PipelineChatMessageRow,
} from "@/dashboard/lib/pipelineClient";

import { conversations as staticConversations, type Conversation, type Message } from "./data";

const COMPANY_SLUG = "thd";
const LIVE_CONVERSATION_ID = "live-copilot-thd";
const DEFAULT_THREAD_TITLE = "Torquemotor-Historie";

// Base contact/shell reused from the existing pinned "Kostencheck Copilot" static conversation
// so the live thread renders with the same avatar/profile details.
const baseConversation = staticConversations[0];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function rowToMessage(row: PipelineChatMessageRow): Message {
  return {
    id: row.id,
    align: row.role === "user" ? "end" : "start",
    text: row.content,
    time: formatTime(row.created_at),
  };
}

function buildConversation(threadId: string, messages: Message[], isPending: boolean): Conversation {
  const lastMessage = messages[messages.length - 1];

  return {
    ...baseConversation,
    id: LIVE_CONVERSATION_ID,
    threadId,
    messages,
    isPending,
    preview: lastMessage?.text ?? baseConversation.preview,
    subject: baseConversation.subject,
    time: lastMessage ? formatTime(lastMessage.time) : baseConversation.time,
  };
}

interface UseLiveCopilotResult {
  /** Null until the seeded thread has loaded (or failed), in which case the static conversations are used untouched. */
  liveConversation: Conversation | null;
  sendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

/** Loads the seeded "Torquemotor-Historie" THD thread live from Supabase and wires up askCopilot for new messages. */
export function useLiveCopilot(): UseLiveCopilotResult {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const threadIdRef = useRef<string | null>(null);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    let cancelled = false;

    fetchChatThreads()
      .then(async (threads) => {
        if (cancelled) return;
        if (threads.length === 0) return;

        const defaultThread = threads.find((t) => t.title === DEFAULT_THREAD_TITLE) ?? threads[0];

        const rows = await fetchChatMessages(defaultThread.id);
        if (cancelled) return;

        setThreadId(defaultThread.id);
        setMessages(rows.map(rowToMessage));
        setReady(true);
      })
      .catch(() => {
        // Chat falls back to the static demo conversations if Supabase is unreachable.
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!threadId) return;

    const reload = () => {
      fetchChatMessages(threadId)
        .then((rows) => setMessages(rows.map(rowToMessage)))
        .catch(() => undefined);
    };

    const unsubscribe = subscribeToTable("pipeline_chat_messages", reload, `thread_id=eq.${threadId}`);
    return unsubscribe;
  }, [threadId]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSending(true);

    const optimisticUser: Message = {
      id: `pending-user-${Date.now()}`,
      align: "end",
      text: trimmed,
      time: formatTime(new Date().toISOString()),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const response = await askCopilot({
        message: trimmed,
        companySlug: COMPANY_SLUG,
        threadId: threadIdRef.current ?? undefined,
      });

      if (response.thread_id && response.thread_id !== threadIdRef.current) {
        setThreadId(response.thread_id);
      }

      // Refetch the canonical thread history so we show the persisted user + assistant rows
      // (replaces the optimistic placeholder with the real, ordered messages).
      const rows = await fetchChatMessages(response.thread_id);
      setMessages(rows.map(rowToMessage));
    } catch {
      // Leave the optimistic user message in place but drop into an error note so the UI
      // doesn't silently look like it's still thinking forever.
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          align: "start",
          text: "Der Copilot ist gerade nicht erreichbar. Bitte versuche es in Kürze erneut.",
          time: formatTime(new Date().toISOString()),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, []);

  const liveConversation = ready && threadId ? buildConversation(threadId, messages, isSending) : null;

  return { liveConversation, sendMessage, isSending };
}
