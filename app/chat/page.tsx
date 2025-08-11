"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Mark chat mode and temporarily restore default cursor
    document.documentElement.classList.add("chat-mode");
    document.documentElement.classList.remove("hide-cursor");
    document.body.classList.remove("cursor-none");
    try {
      (window as any).__disableCustomCursor = true;
      window.dispatchEvent(new CustomEvent("customCursorToggle" as any, { detail: { enabled: false } }));
      window.dispatchEvent(new CustomEvent("cursorMode" as any, { detail: { mode: "none" } }));
    } catch { }
    return () => {
      document.documentElement.classList.remove("chat-mode");
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const onSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Placeholder assistant echo for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `You said: ${trimmed}` },
      ]);
    }, 400);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleTheme = () => {
    const el = document.documentElement;
    if (el.classList.contains("theme-dark")) {
      el.classList.remove("theme-dark");
      el.classList.add("theme-light");
    } else if (el.classList.contains("theme-light")) {
      el.classList.remove("theme-light");
      el.classList.add("theme-dark");
    } else {
      // If no explicit theme, default to dark
      el.classList.add("theme-dark");
    }
  };

  const [mode, setMode] = useState<"light" | "dark">("light");

  const setTheme = (mode: "light" | "dark") => {
    const el = document.documentElement;
    el.classList.remove("theme-light", "theme-dark");
    el.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
    setMode(mode);
  };

  useEffect(() => {
    // Initialize theme from system preference if not explicitly set
    const el = document.documentElement;
    if (!el.classList.contains("theme-light") && !el.classList.contains("theme-dark")) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? "dark" : "light";
      el.classList.add(initial === "dark" ? "theme-dark" : "theme-light");
      setMode(initial);
    } else {
      setMode(el.classList.contains("theme-dark") ? "dark" : "light");
    }
  }, []);

  const toggleThemeMode = () => setTheme(mode === "dark" ? "light" : "dark");

  return (
    <main className="flex min-h-dvh w-full items-stretch justify-center bg-background text-foreground">
      <div className="grid h-[100dvh] w-full grid-cols-1 gap-0 md:[grid-template-columns:220px_minmax(0,1fr)_360px]">
        {/* Left: Profile */}
        <aside className="order-1 border-y-0 border-r p-4 md:order-none md:sticky md:top-0 md:h-[100dvh]">
          <div className="flex flex-col items-center text-center">
            <img
              src="https://picsum.photos/200"
              alt="Profile"
              className="mb-3 size-28 rounded-full object-cover"
            />
            <h2 className="text-lg font-semibold">Your Name</h2>
            <p className="text-xs text-foreground/60">@username</p>
          </div>
        </aside>

        {/* Middle: Chat window */}
        <section className="col-span-1 flex flex-col border-x border-y-0 md:col-span-1 md:row-span-1">
          {/* Header */}
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-base font-semibold">Chat</h1>
              <p className="text-xs text-foreground/60">shadcn-style, responsive</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Freshly re-added Switch for theme */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm">
                  <span className="inline-block size-4 leading-none">{mode === "dark" ? "🌙" : "☀️"}</span>
                  <span className="hidden sm:inline leading-none">{mode === "dark" ? "Dark" : "Light"}</span>
                </span>
                <Switch
                  checked={mode === "dark"}
                  onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
                  aria-label="Toggle theme"
                />
              </div>
              <Button variant="ghost" size="sm">New</Button>
            </div>
          </header>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className="flex w-full">
                <div
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-foreground text-background px-3 py-2 text-sm sm:max-w-[70%]"
                      : "mr-auto max-w-[85%] rounded-lg border px-3 py-2 text-sm sm:max-w-[70%]"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              inputSize="md"
              className="bg-background"
            />
            <Button onClick={onSend} size="md" className="w-20">Send</Button>
          </div>
        </section>

        {/* Right: Projects list */}
        <aside className="border-y-0 border-l p-3 md:sticky md:top-0 md:h-[100dvh]">
          <h2 className="mb-3 text-sm font-semibold">Projects</h2>
          <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-foreground/10">
                  <img
                    src={`https://picsum.photos/seed/${i}/800/450`}
                    alt={`Project ${i}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Project {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground/60">Short description for project {i}.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>
      </div>

      <style jsx global>{`
        /* On chat route: default cursor and no animations for overlays */
        html, body, main { cursor: auto !important; }
        /* Hide any custom cursor overlays if they exist */
        .moonCursor, .sunCursor, .customCursor, .cursor, .cursor-container,
        [data-cursor], #moon-cursor, #sun-cursor { display: none !important; }
        .moonCursor *, .sunCursor *, .customCursor * { pointer-events: none !important; }
        /* Hide star backgrounds/overlays */
        .stars, .star, .twinkle, .starfield, .bg-stars,
        #stars, #starfield, #twinkle,
        [data-stars], [data-layer="stars"], [data-layer="starfield"] {
          display: none !important;
        }
      `}</style>
    </main>
  );
}
