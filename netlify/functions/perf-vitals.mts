import type { Config, Context } from "@netlify/functions";

type Metric = {
  name?: string;
  value?: number;
  rating?: string;
  route?: string;
  ts?: number;
};

const MAX_BODY_BYTES = 16_384;
const ALLOWED_NAMES = new Set(["CLS", "FCP", "INP", "LCP", "LONG_TASK", "TTFB"]);

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  try {
    const payload = await req.json();
    const metrics = Array.isArray(payload?.metrics) ? payload.metrics as Metric[] : [];
    const sanitized = metrics
      .filter((metric) => (
        ALLOWED_NAMES.has(String(metric.name)) &&
        Number.isFinite(metric.value) &&
        typeof metric.route === "string"
      ))
      .slice(0, 20)
      .map((metric) => ({
        name: metric.name,
        value: Math.round(Number(metric.value) * 100) / 100,
        rating: metric.rating,
        route: metric.route?.slice(0, 160),
        ts: metric.ts,
      }));

    if (sanitized.length) {
      console.log(JSON.stringify({
        type: "web-vitals",
        deployId: context.deploy?.id,
        ipCountry: context.geo?.country?.code,
        metrics: sanitized,
      }));
    }
  } catch (error) {
    console.warn("Invalid perf vitals payload", String(error));
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
};

export const config: Config = {
  path: "/api/perf-vitals",
};
