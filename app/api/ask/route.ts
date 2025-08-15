import type { NextRequest } from "next/server";

// Force Node.js runtime so process.env is available at runtime
export const runtime = 'nodejs';
// Avoid any caching in dev/prod for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const RAG_URL = "https://rag.shauqtechnology.in/ask";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RAG_API_KEY;
    const originSecret = process.env.RAG_ORIGIN_SECRET;
    // TEMP: log presence of env (not the secret) for troubleshooting; remove after verifying
    // eslint-disable-next-line no-console
    console.log("/api/ask RAG_API_KEY present?", Boolean(apiKey));
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing RAG_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as any));
    let { question, k } = body ?? {};

    // Basic input validation and bounds consistent with backend
    if (typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "Invalid question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    question = question.trim();
    if (question.length > 1500) {
      return new Response(JSON.stringify({ error: "Question too long (max 1500 chars)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (typeof k !== "number") k = 6;
    if (!Number.isFinite(k)) k = 6;
    k = Math.max(1, Math.min(12, Math.floor(k))); // clamp conservatively

    const upstream = await fetch(RAG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...(originSecret ? { "X-Origin-Secret": originSecret } : {}),
      },
      body: JSON.stringify({ question, k }),
      // A small timeout using AbortController (Next runtime supports fetch timeout via signal)
      // We'll implement a manual timeout in case upstream stalls
      // @ts-ignore
      cache: "no-store",
    });

    const text = await upstream.text();
    // Mirror status and content-type where possible
    const contentType = upstream.headers.get("content-type") || "application/json";
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Upstream error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
