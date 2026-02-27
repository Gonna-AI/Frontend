export interface EndpointDoc {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "WSS";
  path: string;
  title: string;
  description: string;
  color: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  requestBody?: string;
  responseBody?: string;
  queryParams?: {
    name: string;
    type: string;
    required: boolean;
    desc: string;
  }[];
  /** Real Supabase edge function URL for Try It playground */
  realUrl?: string;
  /** Real HTTP method for Try It playground (may differ from documented path) */
  realMethod?: "GET" | "POST" | "PUT" | "DELETE";
  /** Default request body JSON for Try It playground */
  tryItBody?: string;
}

export const BASE_URL = "https://api.clerktree.com/v1";
export const EDGE_FUNCTIONS_URL =
  "https://xlzwfkgurrrspcdyqele.supabase.co/functions/v1";

export const chatEndpoints: EndpointDoc[] = [
  {
    id: "chat-completions",
    method: "POST",
    path: "/chat/completions",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-chat`,
    realMethod: "POST",
    tryItBody: JSON.stringify(
      {
        model: "clerktree-sales-v1",
        messages: [
          { role: "user", content: "Hello, what services do you offer?" },
        ],
        temperature: 0.7,
        max_tokens: 256,
      },
      null,
      2,
    ),
    title: "Create Chat Completion",
    color: "emerald",
    description:
      "Send a message to the ClerkTree Chat model and receive an AI-generated response. The model acts as a blackbox — you provide messages and receive completions without managing model internals.",
    params: [
      {
        name: "model",
        type: "string",
        required: true,
        desc: 'Model ID to use. Currently available: "clerktree-sales-v1", "clerktree-support-v1"',
      },
      {
        name: "messages",
        type: "array",
        required: true,
        desc: 'Array of message objects with role ("system" | "user" | "assistant") and content (string)',
      },
      {
        name: "temperature",
        type: "number",
        required: false,
        desc: "Sampling temperature between 0 and 2. Higher values make output more random. Default: 0.7",
      },
      {
        name: "max_tokens",
        type: "integer",
        required: false,
        desc: "Maximum number of tokens to generate. Default: 1024",
      },
      {
        name: "stream",
        type: "boolean",
        required: false,
        desc: "If true, partial message deltas will be sent as server-sent events. Default: false",
      },
      {
        name: "metadata",
        type: "object",
        required: false,
        desc: "Optional key-value pairs for tracking. Returned in response and webhooks.",
      },
    ],
    requestBody: `curl -X POST "${BASE_URL}/chat/completions" \\
  -H "Authorization: Bearer ct_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "clerktree-sales-v1",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful sales assistant for Acme Corp."
      },
      {
        "role": "user",
        "content": "What pricing plans do you offer?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 512,
    "stream": false,
    "metadata": {
      "lead_id": "lead_8x92k",
      "session_id": "sess_abc"
    }
  }'`,
    responseBody: `{
  "id": "chatcmpl_7kZ3x9Qm",
  "object": "chat.completion",
  "created": 1707700000,
  "model": "clerktree-sales-v1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "We offer three pricing tiers: Starter at $29/mo, Professional at $99/mo, and Enterprise with custom pricing. Each includes..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 156,
    "total_tokens": 198
  },
  "metadata": {
    "lead_id": "lead_8x92k",
    "session_id": "sess_abc"
  }
}`,
  },
  {
    id: "chat-streaming",
    method: "POST",
    path: "/chat/completions",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-chat`,
    realMethod: "POST",
    tryItBody: JSON.stringify(
      {
        model: "clerktree-sales-v1",
        messages: [{ role: "user", content: "Explain your product" }],
        stream: true,
      },
      null,
      2,
    ),
    title: "Streaming Completions",
    color: "emerald",
    description:
      "When stream is set to true, the API returns Server-Sent Events (SSE). Each event contains a partial delta of the response, allowing you to display tokens in real-time.",
    requestBody: `curl -N -X POST "${BASE_URL}/chat/completions" \\
  -H "Authorization: Bearer ct_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "clerktree-sales-v1",
    "messages": [
      { "role": "user", "content": "Explain your product benefits" }
    ],
    "stream": true
  }'`,
    responseBody: `data: {"id":"chatcmpl_7kZ3x9Qm","choices":[{"delta":{"role":"assistant","content":"Our"},"index":0}]}

data: {"id":"chatcmpl_7kZ3x9Qm","choices":[{"delta":{"content":" product"},"index":0}]}

data: {"id":"chatcmpl_7kZ3x9Qm","choices":[{"delta":{"content":" offers"},"index":0}]}

data: [DONE]`,
  },
  {
    id: "chat-history",
    method: "GET",
    path: "/chat/conversations/{conversation_id}/messages",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-chat/history`,
    realMethod: "GET",
    title: "Retrieve Conversation History",
    color: "emerald",
    description:
      "Fetch the full message history for a specific conversation. Useful for loading previous context or auditing interactions.",
    queryParams: [
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Number of messages to return (max 100). Default: 50",
      },
      {
        name: "before",
        type: "string",
        required: false,
        desc: "Cursor for pagination. Return messages before this message ID.",
      },
      {
        name: "order",
        type: "string",
        required: false,
        desc: '"asc" or "desc". Default: "desc"',
      },
    ],
    requestBody: `curl "${BASE_URL}/chat/conversations/conv_12abc/messages?limit=20&order=desc" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "object": "list",
  "data": [
    {
      "id": "msg_9xK2m",
      "role": "assistant",
      "content": "Sure! Our Enterprise plan includes...",
      "created": 1707700120,
      "tokens": 84
    },
    {
      "id": "msg_8xJ1n",
      "role": "user",
      "content": "Tell me about Enterprise pricing",
      "created": 1707700100,
      "tokens": 6
    }
  ],
  "has_more": true,
  "next_cursor": "msg_7wI0o"
}`,
  },
];

export const callEndpoints: EndpointDoc[] = [
  {
    id: "call-initiate",
    method: "POST",
    path: "/calls",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-calls`,
    realMethod: "POST",
    tryItBody: JSON.stringify(
      {
        phone_number: "+14155551234",
        context: { customer_name: "Demo User" },
        voice_id: "nova",
        record: true,
      },
      null,
      2,
    ),
    title: "Initiate Outbound Call",
    color: "pink",
    description:
      "Launch an AI-powered outbound voice call to a phone number. The ClerkTree Call model handles the conversation autonomously using your configured agent persona and knowledge base.",
    params: [
      {
        name: "phone_number",
        type: "string",
        required: true,
        desc: 'E.164 formatted phone number to call (e.g. "+14155551234")',
      },
      {
        name: "agent_id",
        type: "string",
        required: true,
        desc: "ID of the AI agent configuration to use for this call",
      },
      {
        name: "context",
        type: "object",
        required: false,
        desc: "Key-value context injected into the agent prompt (e.g. customer_name, deal_stage)",
      },
      {
        name: "voice_id",
        type: "string",
        required: false,
        desc: 'Override the default voice. Options: "alloy", "echo", "nova", "shimmer"',
      },
      {
        name: "max_duration_seconds",
        type: "integer",
        required: false,
        desc: "Maximum call duration in seconds. Default: 300 (5 min)",
      },
      {
        name: "record",
        type: "boolean",
        required: false,
        desc: "Whether to record the call audio. Default: true",
      },
      {
        name: "webhook_url",
        type: "string",
        required: false,
        desc: "URL to receive call lifecycle events (ringing, answered, completed)",
      },
    ],
    requestBody: `curl -X POST "${BASE_URL}/calls" \\
  -H "Authorization: Bearer ct_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+14155551234",
    "agent_id": "agent_sales_v2",
    "context": {
      "customer_name": "John Smith",
      "company": "Acme Corp",
      "deal_stage": "proposal_sent",
      "previous_interactions": 3
    },
    "voice_id": "nova",
    "max_duration_seconds": 600,
    "record": true,
    "webhook_url": "https://yourapp.com/webhooks/clerktree"
  }'`,
    responseBody: `{
  "id": "call_a1b2c3d4",
  "object": "call",
  "status": "queued",
  "phone_number": "+14155551234",
  "agent_id": "agent_sales_v2",
  "voice_id": "nova",
  "created": 1707700000,
  "estimated_connect": "3s"
}`,
  },
  {
    id: "call-status",
    method: "GET",
    path: "/calls/{call_id}",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-calls`,
    realMethod: "GET",
    title: "Get Call Status",
    color: "pink",
    description:
      "Retrieve the real-time status and details of an active or completed call, including duration, sentiment analysis, and extracted data.",
    requestBody: `curl "${BASE_URL}/calls/call_a1b2c3d4" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "id": "call_a1b2c3d4",
  "object": "call",
  "status": "completed",
  "phone_number": "+14155551234",
  "agent_id": "agent_sales_v2",
  "started_at": 1707700003,
  "ended_at": 1707700250,
  "duration_seconds": 247,
  "recording_url": "https://cdn.clerktree.com/recordings/call_a1b2c3d4.mp3",
  "transcript": [
    { "role": "agent", "content": "Hi John! I am calling from Acme Corp...", "timestamp": 0.0 },
    { "role": "customer", "content": "Oh hi, yes I got your proposal...", "timestamp": 3.2 }
  ],
  "analysis": {
    "sentiment": "positive",
    "interest_level": "high",
    "action_items": ["Send revised quote", "Schedule follow-up next Tuesday"],
    "category": "sales_followup",
    "priority": "high"
  },
  "credits_used": 5
}`,
  },
  {
    id: "call-history",
    method: "GET",
    path: "/calls",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-calls`,
    realMethod: "GET",
    title: "List Call History",
    color: "pink",
    description:
      "Retrieve a paginated list of all calls made through your account. Filter by status, date range, agent, or sentiment.",
    queryParams: [
      {
        name: "status",
        type: "string",
        required: false,
        desc: 'Filter by status: "queued", "ringing", "in_progress", "completed", "failed"',
      },
      {
        name: "agent_id",
        type: "string",
        required: false,
        desc: "Filter by agent configuration ID",
      },
      {
        name: "from",
        type: "string",
        required: false,
        desc: "ISO 8601 start date filter",
      },
      {
        name: "to",
        type: "string",
        required: false,
        desc: "ISO 8601 end date filter",
      },
      {
        name: "sentiment",
        type: "string",
        required: false,
        desc: 'Filter by sentiment: "positive", "neutral", "negative"',
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Results per page (max 100). Default: 25",
      },
      {
        name: "cursor",
        type: "string",
        required: false,
        desc: "Pagination cursor from previous response",
      },
    ],
    requestBody: `curl "${BASE_URL}/calls?status=completed&from=2025-01-01T00:00:00Z&limit=10" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "object": "list",
  "data": [
    {
      "id": "call_a1b2c3d4",
      "status": "completed",
      "phone_number": "+14155551234",
      "agent_id": "agent_sales_v2",
      "duration_seconds": 247,
      "sentiment": "positive",
      "category": "sales_followup",
      "created": 1707700000
    }
  ],
  "has_more": true,
  "next_cursor": "cur_xyz789"
}`,
  },
  {
    id: "call-recording",
    method: "GET",
    path: "/calls/{call_id}/recording",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-calls`,
    realMethod: "GET",
    title: "Get Call Recording",
    color: "pink",
    description:
      "Download or stream the audio recording of a completed call. Returns a signed URL valid for 1 hour.",
    requestBody: `curl "${BASE_URL}/calls/call_a1b2c3d4/recording" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "id": "rec_5e6f7g8h",
  "call_id": "call_a1b2c3d4",
  "url": "https://cdn.clerktree.com/recordings/call_a1b2c3d4.mp3?token=signed_abc",
  "duration_seconds": 247,
  "format": "mp3",
  "size_bytes": 1984000,
  "expires_at": "2025-03-15T11:00:00Z"
}`,
  },
];

export const dashboardEndpoints: EndpointDoc[] = [
  {
    id: "dash-monitor",
    method: "GET",
    path: "/dashboard/monitor",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-dashboard/monitor`,
    realMethod: "GET",
    title: "Live Monitor Data",
    color: "purple",
    description:
      "Retrieve real-time monitoring data for active calls and chats, including live call count, average handle time, queue depth, and agent availability.",
    queryParams: [
      {
        name: "granularity",
        type: "string",
        required: false,
        desc: 'Time granularity for chart data: "1m", "5m", "1h", "1d". Default: "5m"',
      },
    ],
    requestBody: `curl "${BASE_URL}/dashboard/monitor?granularity=5m" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "active_calls": 3,
  "active_chats": 12,
  "queue_depth": 2,
  "avg_handle_time_seconds": 185,
  "total_today": { "calls": 47, "chats": 213 },
  "chart_data": [
    { "timestamp": "2025-03-15T09:00:00Z", "calls": 5, "chats": 18 },
    { "timestamp": "2025-03-15T09:05:00Z", "calls": 7, "chats": 22 }
  ],
  "recent_activity": [
    {
      "type": "call",
      "id": "call_a1b2c3d4",
      "status": "in_progress",
      "started_at": "2025-03-15T09:12:00Z",
      "agent_id": "agent_sales_v2",
      "sentiment": "positive"
    }
  ]
}`,
  },
  {
    id: "dash-analytics",
    method: "GET",
    path: "/dashboard/analytics/sales",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-dashboard/analytics/sales`,
    realMethod: "GET",
    title: "Sales Analytics",
    color: "purple",
    description:
      "Retrieve comprehensive sales analytics including conversion rates, revenue pipeline, top-performing agents, and call/chat outcome breakdowns.",
    queryParams: [
      {
        name: "from",
        type: "string",
        required: false,
        desc: "ISO 8601 start date. Default: 30 days ago",
      },
      {
        name: "to",
        type: "string",
        required: false,
        desc: "ISO 8601 end date. Default: now",
      },
      {
        name: "group_by",
        type: "string",
        required: false,
        desc: '"day", "week", "month". Default: "day"',
      },
    ],
    requestBody: `curl "${BASE_URL}/dashboard/analytics/sales?from=2025-02-01&to=2025-03-01&group_by=week" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "summary": {
    "total_conversations": 1240,
    "conversion_rate": 0.23,
    "avg_deal_value": 4500.00,
    "revenue_pipeline": 128000.00,
    "avg_response_time_seconds": 2.4
  },
  "by_channel": {
    "calls": { "total": 340, "converted": 89, "rate": 0.26 },
    "chats": { "total": 900, "converted": 196, "rate": 0.22 }
  },
  "time_series": [
    { "period": "2025-02-01/2025-02-07", "conversations": 310, "conversions": 72 },
    { "period": "2025-02-08/2025-02-14", "conversations": 295, "conversions": 68 }
  ],
  "top_agents": [
    { "agent_id": "agent_sales_v2", "conversations": 520, "conversion_rate": 0.28 }
  ]
}`,
  },
  {
    id: "dash-leads",
    method: "GET",
    path: "/dashboard/leads",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-dashboard/leads`,
    realMethod: "GET",
    title: "List Leads",
    color: "purple",
    description:
      "Retrieve all leads captured and enriched through AI call and chat interactions. Each lead includes auto-extracted contact info, sentiment, interest level, and recommended next actions.",
    queryParams: [
      {
        name: "status",
        type: "string",
        required: false,
        desc: '"new", "contacted", "qualified", "converted", "lost"',
      },
      {
        name: "priority",
        type: "string",
        required: false,
        desc: '"high", "medium", "low"',
      },
      {
        name: "from",
        type: "string",
        required: false,
        desc: "ISO 8601 date filter",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Results per page. Default: 25",
      },
    ],
    requestBody: `curl "${BASE_URL}/dashboard/leads?status=qualified&priority=high&limit=10" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "object": "list",
  "data": [
    {
      "id": "lead_8x92k",
      "name": "John Smith",
      "company": "Acme Corp",
      "email": "john@acme.com",
      "phone": "+14155551234",
      "status": "qualified",
      "priority": "high",
      "sentiment": "positive",
      "interest_level": 0.92,
      "source": "call",
      "source_id": "call_a1b2c3d4",
      "action_items": ["Send proposal", "Schedule demo"],
      "tags": ["enterprise", "q1-target"],
      "created": "2025-03-15T09:00:00Z",
      "last_interaction": "2025-03-15T09:04:07Z"
    }
  ],
  "has_more": false,
  "total": 1
}`,
  },
  {
    id: "dash-usage",
    method: "GET",
    path: "/dashboard/usage",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-dashboard/usage`,
    realMethod: "GET",
    title: "Usage & Credits",
    color: "purple",
    description:
      "Retrieve your current billing period usage data, including credits consumed, remaining balance, and per-service breakdown.",
    queryParams: [
      {
        name: "from",
        type: "string",
        required: false,
        desc: "ISO 8601 start date for usage window",
      },
      {
        name: "to",
        type: "string",
        required: false,
        desc: "ISO 8601 end date for usage window",
      },
    ],
    requestBody: `curl "${BASE_URL}/dashboard/usage?from=2025-03-01&to=2025-03-15" \\
  -H "Authorization: Bearer ct_live_abc123"`,
    responseBody: `{
  "billing_period": { "start": "2025-03-01", "end": "2025-03-31" },
  "plan": "professional",
  "credits": {
    "total": 5000,
    "used": 2340,
    "remaining": 2660
  },
  "breakdown": {
    "chat": {
      "requests": 1890,
      "tokens_used": 284000,
      "credits_used": 1420
    },
    "calls": {
      "total_calls": 47,
      "total_minutes": 920,
      "credits_used": 920
    }
  },
  "daily_usage": [
    { "date": "2025-03-15", "chat_credits": 95, "call_credits": 60 }
  ]
}`,
  },
  {
    id: "dash-keys",
    method: "POST",
    path: "/dashboard/keys",
    realUrl: `${EDGE_FUNCTIONS_URL}/api-keys`,
    realMethod: "POST",
    tryItBody: JSON.stringify(
      { name: "My Test Key", permissions: ["text", "voice"], rate_limit: 60 },
      null,
      2,
    ),
    title: "Create API Key",
    color: "purple",
    description:
      "Generate a new API key with specific permissions and rate limit settings. Keys can be scoped to specific services (chat, calls, dashboard).",
    params: [
      {
        name: "name",
        type: "string",
        required: true,
        desc: 'Human-readable name for this key (e.g. "Production Backend")',
      },
      {
        name: "permissions",
        type: "array",
        required: true,
        desc: 'Scopes: ["chat", "calls", "dashboard", "admin"]',
      },
      {
        name: "rate_limit",
        type: "integer",
        required: false,
        desc: "Requests per minute. Default: 60",
      },
      {
        name: "expires_at",
        type: "string",
        required: false,
        desc: "ISO 8601 expiration date. Null = never expires",
      },
    ],
    requestBody: `curl -X POST "${BASE_URL}/dashboard/keys" \\
  -H "Authorization: Bearer ct_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Backend",
    "permissions": ["chat", "calls"],
    "rate_limit": 120,
    "expires_at": "2026-01-01T00:00:00Z"
  }'`,
    responseBody: `{
  "id": "key_9z8y7x6w",
  "object": "api_key",
  "name": "Production Backend",
  "token": "ct_live_9z8y7x6w5v4u3t2s1r0q",
  "permissions": ["chat", "calls"],
  "rate_limit": 120,
  "created": "2025-03-15T10:00:00Z",
  "expires_at": "2026-01-01T00:00:00Z",
  "status": "active"
}`,
  },
];

export const errorCodes = [
  {
    code: 400,
    name: "Bad Request",
    desc: "The request body is malformed or missing required fields.",
  },
  {
    code: 401,
    name: "Unauthorized",
    desc: "Invalid or missing API key in the Authorization header.",
  },
  {
    code: 403,
    name: "Forbidden",
    desc: "Your API key does not have permission for this resource.",
  },
  {
    code: 404,
    name: "Not Found",
    desc: "The requested resource does not exist.",
  },
  {
    code: 429,
    name: "Rate Limited",
    desc: "Too many requests. Retry after the time in the Retry-After header.",
  },
  {
    code: 500,
    name: "Server Error",
    desc: "An unexpected error occurred on our end. Contact support if persistent.",
  },
];
