"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700"] });
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Dialog, DialogOverlay, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// (cn not needed here)

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  // Per-card open state: supports tap-to-reveal on touch and hover on desktop
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());
  const isOpen = useCallback((id: number) => openCards.has(id), [openCards]);
  const open = useCallback((id: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);


  // Compute bottom offset from composer height so chips sit above the textbox
  useEffect(() => {
    const updateBottom = () => {
      const h = composerRef?.current?.offsetHeight ?? 64;
      // 8px gap above composer
      setSuggestionsBottom(h + 8);
    };
    updateBottom();
    window.addEventListener('resize', updateBottom);
    return () => window.removeEventListener('resize', updateBottom);
  }, []);

  // Auto-hide the mobile "More Projects" cue after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowCue(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const close = useCallback((id: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  // Mobile profile drawer (declare before effects that use it)
  const [profileOpen, setProfileOpen] = useState(false);
  // Profile image modal state
  const [photoOpen, setPhotoOpen] = useState(false);

  // Close photo modal on Escape
  useEffect(() => {
    if (!photoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhotoOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photoOpen]);
  // Close any open cards when clicking/tapping outside or pressing Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const el = e.target as Element | null;
      if (!el || !el.closest('.project-card')) {
        setOpenCards(new Set());
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCards(new Set());
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown as any);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Lock body scroll when mobile profile drawer is open
  useEffect(() => {
    if (profileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [profileOpen]);

  // Auto-open the hamburger/profile drawer on EVERY visit for screens that show the hamburger (mobile only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)'); // same breakpoint as hamburger visibility (md:hidden)
    if (mq.matches) {
      // Defer to after initial paint to avoid jank
      setTimeout(() => setProfileOpen(true), 0);
    }
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "Show my top projects",
    "What stack do you use?",
    "How can I contact you?",
  ]);
  // Projects data
  const projects: { title: string; repo: string; description: string; placeholder: string; live?: string }[] = [
    {
      title: "Shauq Homelab — Self-Hosted Ubuntu Server",
      repo: "",
      live: "https://home.shauqtechnology.in/",
      description:
        "Self-hosted on Ubuntu 22.04 with Docker Compose and Cloudflare Tunnel/Zero-Trust (no open ports). Hosts 20+ services including Jellyfin, Sonarr, Radarr, Nextcloud, Immich, Pi-hole, Nginx; tuned TLS/HTTP/2; remote HTTPS TTFB improved ~35%.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%23111827' width='100%25' height='100%25'/><text x='50%25' y='46%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='54' fill='%23A5B4FC'>Shauq Homelab</text><text x='50%25' y='60%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='28' fill='%23A5B4FC'>Ubuntu • Docker • Cloudflare</text></svg>",
    },
    {
      title: "Algorithm Visualizer",
      repo: "https://github.com/thealchemist1307/DAA-Assignment/tree/master",
      live: "https://daa-assignment.vercel.app/",
      description:
        "Design & Analysis of Algorithms assignment site. React-based scaffold with public/src structure; simple npm install/start workflow and CodeSandbox setup.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%234A6CF7' width='100%25' height='100%25'/><text x='50%25' y='48%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='56' fill='white'>DAA Assignment</text><text x='50%25' y='60%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='28' fill='white'>React • npm start</text></svg>",
    },
    {
      title: "Algorithm Visualizer",
      repo: "https://github.com/thealchemist1307/daa-assignment-2/tree/master",
      live: "https://daa-assignment-2.vercel.app/visualization",
      description:
        "Second DAA repo oriented to a visualization page. JavaScript-heavy React project with public/src folders and npm scripts; deployed to Vercel.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%23111827' width='100%25' height='100%25'/><text x='50%25' y='46%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='54' fill='%23A5B4FC'>DAA Visualization</text><text x='50%25' y='60%25' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='28' fill='%23A5B4FC'>React • Vercel</text></svg>",
    },
    {
      title: "Employees App",
      repo: "https://github.com/thealchemist1307/employees-app",
      description:
        "Full-stack employee management: React + Tailwind UI with Node/Express GraphQL API using Prisma/PostgreSQL. Dockerized and CI/CD-ready.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%234A6CF7' width='100%' height='100%'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='64' fill='white'>👥 Employees App</text></svg>",
    },
    {
      title: "Three.js Project",
      repo: "https://github.com/thealchemist1307/threejs-project",
      description:
        "React + Vite playground for Three.js experiments; basic scene/camera scaffolding and deployment on Vercel.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%23111827' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='64' fill='%23A5B4FC'>🔺 Three.js Project</text></svg>",
    },
    {
      title: "CompartirApp",
      repo: "https://github.com/thealchemist1307/CompartirApp",
      description:
        "Prototype for a cab-sharing app with a minimalist interface and modern tooling.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%23F59E0B' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='64' fill='%23111827'>🔗 CompartirApp</text></svg>",
    },
    {
      title: "Chatbot Application",
      repo: "https://github.com/thealchemist1307/chatbot-application",
      description:
        "Solution repo for a Chatbot Application: clean scaffolding, tasks, and implementation notes.",
      placeholder:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><rect fill='%230B7C66' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='64' fill='white'>🧪 AQ Assignment</text></svg>",
    },
  ];
  const listRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const [suggestionsBottom, setSuggestionsBottom] = useState<number>(80);

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

  // Use simple 99dvh layout on small screens; flex handles internal sizing

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

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
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
  const [showCue, setShowCue] = useState(true);
  // Track small screens (md breakpoint)
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // Detect touch devices for two-tap behavior on project cards
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsSmallScreen(mq.matches);
    update();
    try {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } catch {
      // Safari fallback
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, []);

  // Identify touch-capable devices (coarse pointer or touch points)
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const hasTouch = 'maxTouchPoints' in navigator ? (navigator.maxTouchPoints ?? 0) > 0 : false;
    setIsTouch(coarse || hasTouch);
  }, []);

  const setTheme = (mode: "light" | "dark") => {
    const el = document.documentElement;
    el.classList.remove("theme-light", "theme-dark");
    el.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
    setMode(mode);
  };

  useEffect(() => {
    // Initialize theme: default to light unless explicitly set
    const el = document.documentElement;
    if (!el.classList.contains("theme-light") && !el.classList.contains("theme-dark")) {
      el.classList.add("theme-light");
      setMode("light");
    } else {
      setMode(el.classList.contains("theme-dark") ? "dark" : "light");
    }
  }, []);

  const toggleThemeMode = () => setTheme(mode === "dark" ? "light" : "dark");

  // Compute mobile projects panel height to fit ~2 cards exactly
  useEffect(() => {
    const pane = document.getElementById('projects-pane');
    if (!pane) return;

    const compute = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        pane.style.removeProperty('--projects-mobile-h');
        return;
      }
      const list = pane.querySelector<HTMLElement>('.projects-scroll');
      const sticky = pane.querySelector<HTMLElement>('.sticky');
      const cards = list?.querySelectorAll<HTMLElement>('.project-card');
      if (!list || !cards || cards.length === 0) return;
      const c1 = cards[0];
      const c2 = cards[1] ?? cards[0];
      const r1 = c1.getBoundingClientRect();
      const r2 = c2.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(list).rowGap || '12');
      const pad = getComputedStyle(pane);
      const padY = (parseFloat(pad.paddingTop || '0') + parseFloat(pad.paddingBottom || '0')) || 0;
      const headerH = sticky ? sticky.getBoundingClientRect().height : 0;
      const height = Math.round(headerH + r1.height + r2.height + gap + padY);
      pane.style.setProperty('--projects-mobile-h', `${height}px`);
    };

    // Recompute on resize and key mutations
    const ro = new ResizeObserver(() => compute());
    ro.observe(pane);
    const list = pane.querySelector('.projects-scroll');
    if (list) ro.observe(list as Element);
    const firstImg = pane.querySelector('.project-card img') as HTMLImageElement | null;
    if (firstImg && !firstImg.complete) {
      firstImg.addEventListener('load', compute, { once: true });
    }
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return (
    <main className={`flex min-h-dvh w-full items-stretch justify-center bg-[#7566c9] text-foreground overflow-x-hidden md:overflow-hidden ${spaceGrotesk.className}`}>
      <div className="grid h-auto md:h-[100dvh] min-h-[100dvh] w-full grid-cols-1 gap-3 md:[grid-template-columns:220px_minmax(0,1fr)_360px] p-3 overflow-visible md:overflow-hidden min-h-0">
        {/* Left: Profile */}
        <aside className="hidden md:block order-1 border-2 border-foreground shadow-brutal p-4 md:order-none rounded-sm h-full overflow-hidden"
          style={{ backgroundColor: '#D7FF3C' }}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 p-1 border-2 border-foreground bg-background shadow-brutal rounded-sm">
              <img
                src="/profile_image_1.png"
                alt="Profile"
                className="size-28 rounded-sm object-cover [image-rendering:pixelated] cursor-pointer"
                role="button"
                aria-label="Open profile photo"
                tabIndex={0}
                onClick={() => setPhotoOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhotoOpen(true); } }}
              />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">Nishit Chouhan</h2>
            <p className="text-xs text-foreground/80 font-mono">@TheAlchemist1307</p>
            <p className="text-[11px] text-foreground/80 font-mono">
              <a href="mailto:nishitrchouhan@gmail.com" className="underline-offset-2 hover:underline">nishitrchouhan@gmail.com</a>
            </p>
            <div className="w-full mt-4">
              <div className="border-2 border-foreground bg-card shadow-brutal rounded-sm px-2 py-1 text-left flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide">Socials</span>
                <span className="flex gap-1" aria-hidden>
                  <i className="w-3 h-3 bg-primary inline-block" />
                  <i className="w-3 h-3 bg-secondary inline-block" />
                  <i className="w-3 h-3 bg-accent inline-block" />
                </span>
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-2">
                {/* Business site – highlighted */}
                <li>
                  <a
                    href="https://shauqtechnology.in/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-[#111827] shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                    style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)' }}
                    aria-label="Open Shauq Technology website"
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M12 2l2.39 4.84L20 8l-4 3.9L17 18l-5-2.6L7 18l1-6.1L4 8l5.61-1.16L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" /></svg>
                    <span className="text-[10px] sm:text-xs">Shauq Technology</span>
                    <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/the.alchemist.1307/" target="_blank" rel="noreferrer noopener"
                    className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                    style={{ background: 'linear-gradient(45deg, #F58529, #FEDA77, #DD2A7B, #8134AF, #515BD4)' }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M16 3H8C5.239 3 3 5.239 3 8v8c0 2.761 2.239 5 5 5h8c2.761 0 5-2.239 5-5V8c0-2.761-2.239-5-5-5Zm3 13c0 1.654-1.346 3-3 3H8c-1.654 0-3-1.346-3-3V8c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v8Zm-3.5-8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="currentColor" /></svg>
                    <span className="text-xs sm:text-sm">Instagram</span>
                    <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/nishit-chouhan/" target="_blank" rel="noreferrer noopener"
                    className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                    style={{ backgroundColor: '#0A66C2' }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M6 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM0 24V7h6v17H0Zm8 0V7h6v2.5c.9-1.5 2.7-2.5 4.9-2.5 3.7 0 5.1 2 5.1 6.1V24h-6v-9.2c0-2.1-.8-3.2-2.3-3.2-1.6 0-2.6 1.1-2.6 3.2V24H8Z" fill="currentColor" /></svg>
                    <span className="text-xs sm:text-sm">LinkedIn</span>
                    <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/thealchemist1307" target="_blank" rel="noreferrer noopener"
                    className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                    style={{ backgroundColor: '#111111' }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M12 .5C5.73.5.94 5.29.94 11.56c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.66.08-.66 1.1.08 1.68 1.12 1.68 1.12.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.68-1.48-2.44-.28-5.01-1.22-5.01-5.42 0-1.2.43-2.18 1.12-2.95-.11-.28-.49-1.42.11-2.96 0 0 .93-.3 3.05 1.13.88-.24 1.82-.36 2.76-.36.94 0 1.88.12 2.76.36 2.12-1.43 3.05-1.13 3.05-1.13.6 1.54.22 2.68.11 2.96.69.77 1.12 1.75 1.12 2.95 0 4.21-2.57 5.13-5.02 5.4.39.34.73 1.02.73 2.06 0 1.49-.01 2.69-.01 3.06 0 .3.2.65.76.54 4.36-1.46 7.5-5.57 7.5-10.43C23.06 5.29 18.27.5 12 .5Z" fill="currentColor" /></svg>
                    <span className="text-xs sm:text-sm">GitHub</span>
                    <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@thealchemist1307" target="_blank" rel="noreferrer noopener"
                    className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                    style={{ backgroundColor: '#FF0000' }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M23.5 7.6a3.2 3.2 0 0 0-2.25-2.25C19.5 4.8 12 4.8 12 4.8s-7.5 0-9.25.55A3.2 3.2 0 0 0 .5 7.6 33.4 33.4 0 0 0 0 12a33.4 33.4 0 0 0 .5 4.4 3.2 3.2 0 0 0 2.25 2.25C4.5 19.2 12 19.2 12 19.2s7.5 0 9.25-.55a3.2 3.2 0 0 0 2.25-2.25A33.4 33.4 0 0 0 24 12a33.4 33.4 0 0 0-.5-4.4ZM9.75 15.25v-6.5L15.5 12l-5.75 3.25Z" fill="currentColor" /></svg>
                    <span className="text-xs sm:text-sm">YouTube</span>
                    <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                  </a>
                </li>
              </ul>
            </div>
            {/* Back to Home (desktop) */}
            <div className="w-full mt-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 border-2 border-foreground bg-background text-foreground shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:bg-secondary hover:text-secondary-foreground focus-brutal"
                aria-label="Back to Home"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
                <span className="text-xs">Back to Home</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Middle: Chat window */}
        <section ref={sectionRef} className="col-span-1 relative flex h-[99dvh] md:h-full flex-col border-2 border-foreground shadow-brutal md:col-span-1 md:row-span-1 rounded-sm overflow-visible"
          style={{ backgroundColor: '#FFC1DC' }}>
          {/* Header */}
          <header ref={headerRef} className="flex items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Hamburger for small screens */}
              <button
                type="button"
                className="md:hidden focus-brutal border-2 border-foreground bg-background text-foreground rounded-sm shadow-brutal p-1.5"
                aria-label="Open profile panel"
                aria-controls="mobile-profile-drawer"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                </svg>
              </button>
              <h1 className="text-base font-semibold">Chat</h1>
              <p className="text-xs text-foreground/60">shadcn-style, responsive</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">New</Button>
            </div>
          </header>

          {/* Messages (restored bubble style/colors) */}
          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex w-full">
                {m.role === 'user' ? (
                  <div className="ml-auto max-w-[85%] sm:max-w-[70%] relative">
                    <div
                      className="rounded-xl border-2 border-foreground px-3 py-2 text-sm leading-6 tracking-tight shadow-brutal"
                      style={{ backgroundColor: '#F5D0FF', color: '#1B1B1B' }}
                    >
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="mr-auto max-w-[85%] sm:max-w-[70%] relative">
                    <div
                      className="rounded-xl border-2 border-foreground px-3 py-2 text-sm leading-6 tracking-tight shadow-brutal"
                      style={{ backgroundColor: '#FFF3D6', color: 'var(--foreground)' }}
                    >
                      {m.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile scroll cue to Projects (restore formatting, no top border, keep bounce, auto-hide) */}
          {showCue && (
            <div ref={cueRef} className="md:hidden bg-transparent text-foreground flex items-center justify-center gap-2 py-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-foreground rounded-sm bg-secondary text-secondary-foreground shadow-brutal focus-brutal active:scale-[.98] transition-transform animate-bounce"
                onClick={() => {
                  const el = document.getElementById('projects-pane');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                aria-label="Scroll to projects"
              >
                <span className="text-xs font-black uppercase tracking-wide">More Projects</span>
                <span aria-hidden>↓</span>
              </button>
            </div>
          )}

          {/* Floating suggestion chips inside chat box (no clipping).
              Hide on small screens while the mobile cue is visible. */}
          {(!isSmallScreen || !showCue) && (
            <div className="pointer-events-none absolute inset-x-0 z-20 px-[10px] mx-[10px]" style={{ bottom: suggestionsBottom }}>
              <div className="pointer-events-auto flex flex-nowrap whitespace-nowrap gap-2 justify-end overflow-x-auto overflow-y-visible scroll-px-3 snap-x snap-mandatory pr-3">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="group border-2 border-foreground rounded-sm bg-secondary text-secondary-foreground px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide focus-brutal inline-flex items-center gap-1.5 snap-start whitespace-nowrap shadow-brutal mb-[10px]"
                    onClick={() => { sendText(q); setSuggestions((prev) => prev.filter((s) => s !== q)); }}
                    aria-label={`Ask: ${q}`}
                  >
                    <span className="inline-flex items-center gap-1.5 transition-transform group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]">
                      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" /></svg>
                      {q}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div ref={composerRef} className="grid grid-cols-[1fr_auto] items-center gap-2 border-t-2 border-foreground bg-card p-3">
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
        <aside id="projects-pane" className="border-2 border-foreground bg-muted shadow-brutal p-3 rounded-sm h-auto md:h-full md:max-h-none overflow-visible md:overflow-hidden flex flex-col min-h-0 mb-3 md:mb-0" aria-labelledby="projects-heading" style={{ height: 'var(--projects-mobile-h)' }}>
          <div className="sticky top-0 z-10">
            <div id="projects-heading" className="border-2 border-foreground bg-secondary text-secondary-foreground shadow-brutal px-3 py-2 rounded-sm flex items-center justify-between">
              <span className="font-black tracking-wide uppercase text-sm md:text-base">Projects</span>
              <span className="flex gap-1" aria-hidden>
                <i className="w-3 h-3 bg-primary inline-block" />
                <i className="w-3 h-3 bg-accent inline-block" />
              </span>
            </div>
            <div className="h-1 bg-gradient-to-r from-accent via-primary to-secondary -mt-1 mb-3 border-x-2 border-b-2 border-foreground rounded-b-sm" />
          </div>
          <div className="projects-scroll flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1">
            {projects.map((p, idx) => {
              const i = idx + 1;
              const gradientClasses = [
                'bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-300',
                'bg-gradient-to-br from-violet-400 via-purple-600 to-indigo-300',
                'bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700',
                'bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-700',
                'bg-gradient-to-br from-rose-300 via-red-500 to-rose-700',
              ];
              const grad = gradientClasses[idx % gradientClasses.length];
              return (
                <div
                  key={`${p.title}-${i}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${p.title} ${p.live ? 'live site' : 'repository'}`}
                  aria-expanded={isOpen(i)}
                  aria-controls={`project-meta-${i}`}
                  className={`project-card nb-card focus-brutal ${isOpen(i) ? 'nb-card-open' : ''} border-2 border-foreground p-1 shadow-brutal rounded-sm bg-card overflow-visible flex-shrink-0 focus-within:outline-none`}
                  onMouseEnter={() => open(i)}
                  onMouseLeave={() => close(i)}
                  onFocus={() => open(i)}
                  onBlur={() => close(i)}
                  onClick={() => {
                    const url = p.live || p.repo;
                    if (isTouch) {
                      if (!isOpen(i)) {
                        // On touch: first tap opens, second tap navigates
                        open(i);
                        return;
                      }
                      if (url) window.open(url, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    // Non-touch: click navigates directly (hover shows details)
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isOpen(i)) {
                        open(i);
                      } else {
                        const url = p.live || p.repo;
                        if (url) window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }
                  }}
                >
                  <div className={`pc-image relative w-full overflow-hidden border-x-2 border-t-2 border-foreground rounded-t-sm h-32 sm:h-auto sm:[aspect-ratio:16/9] ${grad}`}>
                    {/* Pixel effects over pure gradient background */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(transparent 0, transparent calc(100% - 1px), rgba(0,0,0,0.25) 1px), linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(0,0,0,0.25) 1px)',
                        backgroundSize: '8px 8px',
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 2px)',
                      }}
                    />
                    {/* Header label shown before card opens */}
                    <div
                      className={`pc-title absolute right-2 top-2 bg-secondary text-secondary-foreground border-2 border-foreground px-2 py-0.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide shadow-brutal z-10 transition-all duration-200 ${isOpen(i) ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
                    >
                      {p.title}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-primary to-secondary opacity-80" />
                  </div>
                  <div id={`project-meta-${i}`} className="pc-meta transition-all border-x-2 border-b-2 border-foreground rounded-b-sm bg-background">
                    <div className="flex items-center justify-between px-2 py-1 border-t-2 border-foreground relative">
                      <span className="pc-title-text font-mono text-xs md:text-[13px]">{p.title}</span>
                      <span className="flex gap-1">
                        <i className="w-3 h-3 bg-primary inline-block" />
                        <i className="w-3 h-3 bg-secondary inline-block" />
                        <i className="w-3 h-3 bg-accent inline-block" />
                      </span>
                    </div>
                    <div className="px-2 pb-2 text-[11px] text-foreground/70">
                      <p>
                        {p.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <a
                          href={p.repo}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 border-2 border-foreground bg-background text-foreground rounded-sm px-2 py-0.5 shadow-brutal focus-brutal hover:bg-secondary hover:text-secondary-foreground"
                          aria-label={`Open ${p.title} repository`}
                        >
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3h7v7M21 3l-9 9M5 5v16h16" stroke="currentColor" strokeWidth="2" /></svg>
                          <span className="text-[10px] font-semibold uppercase tracking-wide">Repo</span>
                        </a>
                        {p.live && (
                          <a
                            href={p.live}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 border-2 border-foreground bg-background text-foreground rounded-sm px-2 py-0.5 shadow-brutal focus-brutal hover:bg-secondary hover:text-secondary-foreground"
                            aria-label={`Open ${p.title} live site`}
                          >
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3h7v7M21 3l-9 9M5 5v16h16" stroke="currentColor" strokeWidth="2" /></svg>
                            <span className="text-[10px] font-semibold uppercase tracking-wide">Live</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Mobile Profile Drawer + Overlay (render only when open to avoid intercepting taps) */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" aria-hidden={!profileOpen}>
          {/* Overlay */}
          <button
            aria-label="Close profile panel"
            className="absolute inset-0 bg-black/40 transition-opacity opacity-100"
            onClick={() => setProfileOpen(false)}
          />
          {/* Drawer */}
          <aside
            id="mobile-profile-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-profile-title"
            className={`absolute left-0 top-0 h-full w-[85vw] max-w-[320px] border-2 border-foreground shadow-brutal rounded-r-sm overflow-y-auto p-4 bg-[#D7FF3C] transform transition-transform duration-200 translate-x-0`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="mobile-profile-title" className="text-base font-extrabold tracking-tight">Profile</h2>
              <button
                type="button"
                className="focus-brutal border-2 border-foreground bg-background text-foreground rounded-sm shadow-brutal p-1"
                aria-label="Close"
                onClick={() => setProfileOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" /></svg>
              </button>
            </div>
            {/* Reuse the same profile content */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 p-1 border-2 border-foreground bg-background shadow-brutal rounded-sm">
                <img
                  src="/profile_image_1.png"
                  alt="Profile"
                  className="size-28 rounded-sm object-cover [image-rendering:pixelated] cursor-pointer"
                  role="button"
                  aria-label="Open profile photo"
                  tabIndex={0}
                  onClick={() => setPhotoOpen(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhotoOpen(true); } }}
                />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">Nishit Chouhan</h2>
              <p className="text-xs text-foreground/80 font-mono">@TheAlchemist1307</p>
              <p className="text-[11px] text-foreground/80 font-mono">
                <a href="mailto:nishitchouhan@shauqtechnology.com" className="underline-offset-2 hover:underline">nishitchouhan@shauqtechnology.com</a>
              </p>
              <div className="w-full mt-4">
                <div className="border-2 border-foreground bg-card shadow-brutal rounded-sm px-2 py-1 text-left flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Socials</span>
                  <span className="flex gap-1" aria-hidden>
                    <i className="w-3 h-3 bg-primary inline-block" />
                    <i className="w-3 h-3 bg-secondary inline-block" />
                    <i className="w-3 h-3 bg-accent inline-block" />
                  </span>
                </div>
                <ul className="mt-2 grid grid-cols-1 gap-2">
                  {/* Business site – highlighted (mobile) */}
                  <li>
                    <a
                      href="https://shauqtechnology.in/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-[#111827] shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                      style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)' }}
                      aria-label="Open Shauq Technology website"
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M12 2l2.39 4.84L20 8l-4 3.9L17 18l-5-2.6L7 18l1-6.1L4 8l5.61-1.16L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" /></svg>
                      <span className="text-[10px] sm:text-xs">Shauq Technology</span>
                      <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/the.alchemist.1307/" target="_blank" rel="noreferrer noopener"
                      className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                      style={{ background: 'linear-gradient(45deg, #F58529, #FEDA77, #DD2A7B, #8134AF, #515BD4)' }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M16 3H8C5.239 3 3 5.239 3 8v8c0 2.761 2.239 5 5 5h8c2.761 0 5-2.239 5-5V8c0-2.761-2.239-5-5-5Zm3 13c0 1.654-1.346 3-3 3H8c-1.654 0-3-1.346-3-3V8c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v8Zm-3.5-8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="currentColor" /></svg>
                      <span className="text-xs sm:text-sm">Instagram</span>
                      <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.linkedin.com/in/nishit-chouhan/" target="_blank" rel="noreferrer noopener"
                      className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                      style={{ backgroundColor: '#0A66C2' }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M6 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM0 24V7h6v17H0Zm8 0V7h6v2.5c.9-1.5 2.7-2.5 4.9-2.5 3.7 0 5.1 2 5.1 6.1V24h-6v-9.2c0-2.1-.8-3.2-2.3-3.2-1.6 0-2.6 1.1-2.6 3.2V24H8Z" fill="currentColor" /></svg>
                      <span className="text-xs sm:text-sm">LinkedIn</span>
                      <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/thealchemist1307" target="_blank" rel="noreferrer noopener"
                      className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                      style={{ backgroundColor: '#111111' }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M12 .5C5.73.5.94 5.29.94 11.56c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.66.08-.66 1.1.08 1.68 1.12 1.68 1.12.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.68-1.48-2.44-.28-5.01-1.22-5.01-5.42 0-1.2.43-2.18 1.12-2.95-.11-.28-.49-1.42.11-2.96 0 0 .93-.3 3.05 1.13.88-.24 1.82-.36 2.76-.36.94 0 1.88.12 2.76.36 2.12-1.43 3.05-1.13 3.05-1.13.6 1.54.22 2.68.11 2.96.69.77 1.12 1.75 1.12 2.95 0 4.21-2.57 5.13-5.02 5.4.39.34.73 1.02.73 2.06 0 1.49-.01 2.69-.01 3.06 0 .3.2.65.76.54 4.36-1.46 7.5-5.57 7.5-10.43C23.06 5.29 18.27.5 12 .5Z" fill="currentColor" /></svg>
                      <span className="text-xs sm:text-sm">GitHub</span>
                      <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/@thealchemist1307" target="_blank" rel="noreferrer noopener"
                      className="social-link focus-brutal group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1 sm:gap-2 text-center sm:text-left border-2 border-foreground text-white shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:brightness-95 transition"
                      style={{ backgroundColor: '#FF0000' }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M23.5 7.6a3.2 3.2 0 0 0-2.25-2.25C19.5 4.8 12 4.8 12 4.8s-7.5 0-9.25.55A3.2 3.2 0 0 0 .5 7.6 33.4 33.4 0 0 0 0 12a33.4 33.4 0 0 0 .5 4.4 3.2 3.2 0 0 0 2.25 2.25C4.5 19.2 12 19.2 12 19.2s7.5 0 9.25-.55a3.2 3.2 0 0 0 2.25-2.25A33.4 33.4 0 0 0 24 12a33.4 33.4 0 0 0-.5-4.4ZM9.75 15.25v-6.5L15.5 12l-5.75 3.25Z" fill="currentColor" /></svg>
                      <span className="text-xs sm:text-sm">YouTube</span>
                      <span className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>↗</span>
                    </a>
                  </li>
                </ul>
                {/* Back to Home (mobile) */}
                <div className="w-full mt-4">
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 border-2 border-foreground bg-background text-foreground shadow-brutal rounded-sm px-3 py-1.5 font-semibold uppercase tracking-wide hover:bg-secondary hover:text-secondary-foreground focus-brutal"
                    aria-label="Back to Home"
                    onClick={() => setProfileOpen(false)}
                  >
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
                    <span className="text-xs">Back to Home</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Profile Photo Dialog */}
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogOverlay />
        <DialogContent>
          <div className="relative border-2 border-foreground bg-primary shadow-brutal rounded-sm p-2 max-w-[min(92vw,700px)] max-h-[90vh] flex items-center justify-center">
            <img
              src="/profile_image_1.png"
              alt="Profile enlarged"
              className="max-w-full max-h-[82vh] object-contain"
            />
            <div className="absolute top-3 right-3 md:top-4 md:right-4">
              <DialogClose aria-label="Close image" className="p-0 m-0 bg-transparent border-0 shadow-none inline-flex">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 border-2 border-foreground bg-background text-foreground shadow-brutal rounded-sm hover:bg-secondary hover:text-secondary-foreground"
                  aria-hidden
                >
                  {/* Cross icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        /* On chat route: allow vertical scroll on small screens */
        html, body, main { cursor: auto !important; height: 100dvh; overflow-x: hidden; overflow-y: auto; }
        @media (min-width: 768px) {
          html, body, main { overflow: hidden; }
        }
        /* Hide any custom cursor overlays if they exist */
        .moonCursor, .sunCursor, .customCursor, .cursor, .cursor-container,
        [data-cursor], #moon-cursor, #sun-cursor { display: none !important; pointer-events: none !important; }
        /* Hide star backgrounds/overlays */
        .stars, .star, .twinkle, .starfield, .bg-stars,
        #stars, #starfield, #twinkle,
        [data-stars], [data-layer="stars"], [data-layer="starfield"] {
          display: none !important; pointer-events: none !important;
        }
        /* Improve tap responsiveness and avoid ghost overlays capturing taps */
        button, a, input, textarea, select, [role="button"] { touch-action: manipulation; }
        /* Card state: simple opacity change only (previous outline hover removed) */
        .nb-card {
          opacity: .88;
          transition: opacity .25s ease, transform .2s ease;
        }
        .nb-card:hover, .nb-card:focus-visible { opacity: 1; transform: scale(1.02); }
        .nb-card:active { transform: scale(.98); }
        /* High-contrast keyboard focus ring */
        .focus-brutal:focus-visible { outline: none !important; box-shadow:
          0 0 0 2px var(--background),
          0 0 0 4px var(--foreground),
          6px 6px 0 0 rgba(0,0,0,.35) !important; }
        /* Social links motion + compact stack already handled by layout classes */
        .social-link { transition: transform .18s ease, filter .18s ease; }
        .social-link:hover, .social-link:focus-visible { transform: scale(1.02); }
        .social-link:active { transform: scale(.98); }
        /* Image-first reveal: start with only the image visible */
        .nb-card .pc-image img { transform: scale(1.08); transition: transform .35s ease; }
        .nb-card .pc-meta { max-height: 0; opacity: 0; overflow: hidden; transition: max-height .35s ease, opacity .25s ease; }
        .nb-card-open .pc-image img, .nb-card:hover .pc-image img, .nb-card:focus-visible .pc-image img { transform: scale(1); }
        .nb-card-open .pc-meta, .nb-card:hover .pc-meta, .nb-card:focus-visible .pc-meta { max-height: 300px; opacity: 1; }
        /* Improve mobile scroll behavior */
        .projects-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-y; }
        /* Ensure the grid wrapper allows internal scroll areas to size properly */
        .min-h-0, .min-h-0 * { min-height: 0; }
        /* Transform the over-image badge into the header title */
        .pc-title { 
          transition: transform .35s ease, background-color .25s ease, color .25s ease, border-color .25s ease, box-shadow .2s ease, font-size .25s ease, padding .25s ease; 
          transform-origin: top right; 
        }
        /* Fade the over-image badge out when open; no morph */
        .pc-title { transition: opacity .25s ease; }
        .nb-card-open .pc-title, .nb-card:hover .pc-title, .nb-card:focus-visible .pc-title { opacity: 0; }
        /* Pixel art UI for project title text */
        .pc-title, .pc-title-text {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          text-transform: uppercase;
          letter-spacing: 0;
          image-rendering: pixelated;
        }
        .pc-title {
          box-shadow: 0 0 0 2px var(--foreground), 6px 6px 0 0 rgba(0,0,0,.35);
        }
        .pc-title-text {
          text-shadow: 1px 1px 0 var(--background), 2px 2px 0 var(--foreground);
        }
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .nb-card .pc-image img { transition: none; }
          .nb-card .pc-meta { transition: none; }
          .pc-title { transition: none; }
          .nb-card, .social-link { transition: none; }
          .nb-card:hover, .nb-card:focus-visible, .social-link:hover, .social-link:focus-visible { transform: none; }
          .nb-card:active, .social-link:active { transform: none; }
          #mobile-profile-drawer { transition: none !important; }
          #mobile-profile-drawer { transform: none !important; }
        }
      `}</style>
    </main>
  );
}
