// API Base URL - MUST be configured via environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("❌ VITE_API_BASE_URL is not configured! API calls will fail.");
}

// Create an axios instance with default config
import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

// Inject Supabase auth token into every request
api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Silently proceed without token if auth check fails
  }
  return config;
});

// Add an interceptor to handle retries for 5xx / network errors + 401 redirects
const MAX_RETRIES = 3;
const BASE_DELAY = 500;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Don't retry if config is missing or already exceeded max retries
    if (!config || config._retryCount >= MAX_RETRIES) {
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Redirect on 401 immediately (no retry)
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Retry on 5xx or network errors
    const isServerError = error.response?.status >= 500;
    const isNetworkError = !error.response && error.code !== "ERR_CANCELED";

    if (isServerError || isNetworkError) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = BASE_DELAY * Math.pow(2, config._retryCount - 1);
      console.warn(
        `[api] Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  },
);

// Notification API endpoints
export const notificationsApi = {
  getAll: () => api.get("/api/notifications"),
  markAsRead: (notification_ids: number[]) =>
    api.post("/api/notifications/mark-read", { notification_ids }),
};

// Audio handling
export const audioApi = {
  startConversation: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "input.wav");
    return api.post("/api/conversation/stream", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  stopAIResponse: () => api.post("/api/conversation/stop"),
};

// Document handling
export const documentApi = {
  analyzeDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/upload/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Ticket-ID": api.defaults.headers["X-Ticket-ID"],
      },
    });
  },
  submitDocuments: (documentIds: string[]) =>
    api.put(
      "/api/documents",
      { document_ids: documentIds },
      {
        headers: {
          "X-Ticket-ID": api.defaults.headers["X-Ticket-ID"],
        },
      },
    ),
  listDocuments: () =>
    api.get("/api/documents/list", {
      headers: {
        "X-Ticket-ID": api.defaults.headers["X-Ticket-ID"],
      },
    }),
  analyzeDocuments: () =>
    api.get("/api/documents", {
      headers: {
        "X-Ticket-ID": api.defaults.headers["X-Ticket-ID"],
      },
    }),
  processBlockchain: async (formData: FormData) => {
    return await api.post("/api/documents/blockchain", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  verifyBlockchain: async (documentHash: string) => {
    return await api.post("/api/documents/blockchain/verify", {
      document_hash: documentHash,
    });
  },
  getVerificationStatus: () =>
    api.get("/api/documents/status", {
      headers: {
        "X-Ticket-ID": api.defaults.headers["X-Ticket-ID"],
      },
    }),
};

interface CreateTicketData {
  name: string;
  mobile?: string;
  agent_id?: string;
  email?: string;
}

// Add new ticket-related endpoints
export const ticketApi = {
  create: (data: CreateTicketData) =>
    api.post("/api/ticket/create", {
      client_name: data.name,
      mobile: data.mobile,
      agent_id: data.agent_id,
      email: data.email,
    }),
  validate: (ticketId: string) => api.get(`/api/ticket/${ticketId}`),
  getPriority: () => api.get("/api/priority"),
  getDetails: (ticketId: string) => api.get(`/api/client/${ticketId}/contact`),
  getSummary: (clientId: number) =>
    api.get(`/api/conversations/summary/${clientId}`),
};

// Update api instance to handle ticket header
export const setTicketHeader = (ticketId: string | null) => {
  if (ticketId) {
    api.defaults.headers["X-Ticket-ID"] = ticketId;
  } else {
    delete api.defaults.headers["X-Ticket-ID"];
  }
};

// Add ElevenLabs endpoints
export const elevenLabsApi = {
  startConversation: async () => {
    const response = await axios.post(`${API_BASE_URL}/api/elevenlabs/start`);
    return response.data;
  },

  stopConversation: async () => {
    const response = await axios.post(`${API_BASE_URL}/api/elevenlabs/stop`);
    return response.data;
  },

  // Add other ElevenLabs-related endpoints
};

export const adminApi = {
  getPendingDocuments: () => api.get("/api/admin/documents"),
  verifyDocument: (documentId: string) =>
    api.post(`/api/admin/documents/${documentId}/verify`),
  rejectDocument: (documentId: string) =>
    api.post(`/api/admin/documents/${documentId}/reject`),
  downloadDocuments: (ticketId: string) =>
    api.get(`/api/documents/download/${ticketId}`, { responseType: "blob" }),
  verifyBlockchain: (documentId: string) =>
    api.post(`/api/admin/documents/${documentId}/verify-blockchain`),
  getBlockchainInfo: async (documentHash: string) => {
    return await api.get(`/api/blockchain/document/${documentHash}`);
  },
  verifyBlockchainByHash: async (documentId: string) => {
    return await api.post(`/api/blockchain/verify/${documentId}`);
  },
  downloadFromBlockchain: async (documentHash: string) => {
    return await api.get(`/api/blockchain/download/${documentHash}`, {
      responseType: "blob",
    });
  },
  markBusyDates: (dates: { dates: string[] }) =>
    api.post("/api/admin/availability", dates),
  unmarkBusyDates: (dates: { dates: string[] }) =>
    api.delete("/api/admin/availability", { data: dates }),
  getBusyDates: () => api.get("/api/admin/availability"),
};

export default api;
