import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const RAG_STREAM_URL = "https://rag.shauqtechnology.in/ask/stream";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RAG_API_KEY;
    const originSecret = process.env.RAG_ORIGIN_SECRET;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing RAG_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // minimal validation
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (!question || question.length > 1500) {
      return new Response(JSON.stringify({ error: "Invalid question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    let k = Number.isFinite(body?.k) ? Math.floor(body.k) : 6;
    if (!Number.isFinite(k)) k = 6;
    k = Math.max(1, Math.min(10, k));

    const upstream = await fetch(RAG_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...(originSecret ? { "X-Origin-Secret": originSecret } : {}),
      },
      body: JSON.stringify({ question, k }),
      // ensure no caching
      // @ts-ignore
      cache: "no-store",
      // Propagate client abort to upstream to avoid hanging connections
      signal: req.signal,
    });

    // Forward non-OK as-is (with text body if present)
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      return new Response(text || JSON.stringify({ error: "Upstream error" }), {
        status: upstream.status,
        headers: { "Content-Type": upstream.headers.get("content-type") || "text/plain" },
      });
    }

    // Pipe the SSE stream to the client
    const readable = upstream.body;

    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    // Allow browsers to receive data while tab hidden
    headers.set("X-Accel-Buffering", "no");

    return new Response(readable, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Upstream error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
