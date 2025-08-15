'use client';

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import TestGif from './test-gif';
import BouncingText from "./components/BouncingText";
import CloudHint from "./components/CloudHint";
import PressStart from "./components/PressStart";
import RunningCharacter from './components/RunningCharacter';
import { Switch } from "../components/ui/switch";

export default function LandingPage() {
  const [pauseBanner, setPauseBanner] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [crtMode, setCrtMode] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      const isMoon = e?.detail?.isMoon;
      setPauseBanner(!!isMoon);
    };
    window.addEventListener('cursorPosition' as any, handler as EventListener);
    return () => window.removeEventListener('cursorPosition' as any, handler as EventListener);
  }, []);

  // Track viewport size for debugging
  useEffect(() => {
    const update = () => setViewport({
      w: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      h: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // On small and medium screens, start scrolled to the bottom (so users land at the end)
  useEffect(() => {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const isSmOrMd = width < 1024; // match md breakpoint upper bound
    if (!isSmOrMd) return;

    const scrollToBottom = () => {
      const doc = document.documentElement;
      const top = Math.max(doc.scrollHeight - doc.clientHeight, 0);
      window.scrollTo({ top, behavior: 'auto' });
    };

    // Initial after layout
    requestAnimationFrame(scrollToBottom);
    // Nudge after async content (images/fonts) settles
    const t1 = setTimeout(scrollToBottom, 200);
    const t2 = setTimeout(scrollToBottom, 600);

    // If DOM changes significantly (late mounts), try again briefly
    const mo = new MutationObserver(() => scrollToBottom());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      mo.disconnect();
    };
  }, []);

  const bp = viewport.w >= 1024 ? 'lg' : viewport.w >= 640 ? 'md' : 'sm';
  const bannerTranslateY = bp === 'lg' ? '5%' : bp === 'md' ? '8%' : '10%';
  // Match banner scroll speed with character horizontal speed (~125px/s)
  // After increasing character scale, the perceived ground speed changed due to banner height (vh) and perspective.
  // We tune a breakpoint-based factor tied to viewport height for better visual sync.
  const characterSpeedPxPerSec = 125; // from RunningCharacter.tsx (speed=2; 2/16 * 1000)
  const heightFactor = bp === 'lg' ? 0.46 : bp === 'md' ? 0.50 : 0.54; // slight per-bp foreshortening differences
  const bannerDurationSec = Math.max(1.0, Math.min(10, (heightFactor * viewport.h) / characterSpeedPxPerSec));

  return (
    <>
      {/* Global toggle to switch between Classic and CRT overlay (hidden for now) */}
      {/* Info button positioned below CRT effect */}
      <div className="fixed left-1/2 bottom-8 z-[100] transform -translate-x-1/2">
        <a
          href="/chat"
          className="border-2 border-foreground bg-card text-foreground shadow-brutal rounded-sm px-6 py-2 flex items-center gap-2 cursor-pointer select-none hover:bg-accent hover:text-accent-foreground transition-colors"
          role="button"
        >
          <span className="text-sm font-mono font-bold">Chat with Me</span>
        </a>
      </div>

      {/* Always-on CRT overlay and container for both modes */}
      <main className="min-h-screen bg-background text-foreground w-screen overflow-x-hidden">
        {/* Top-level CRT overlay above all views (home-only) */}
        <div className="crt-overlay" aria-hidden />

        {/* CRT on/off switch (internal power effect) */}
        <input id="crt-switch" type="checkbox" defaultChecked className="crt-switch hidden" />
        <label htmlFor="crt-switch" className="crt-switch-label fixed right-4 top-4 z-[60] select-none">
          <span className="dot" />
          <span className="text">Turn </span>
        </label>

        {/* CRT container wraps either classic content or detailed info content */}
        <div className="crt-container w-full">
          <div className="crt-screen w-full">
            {crtMode ? (
              // INFO MODE: Detailed hero + chat preview
              <>
                <section className="relative overflow-hidden border-b-2 border-foreground">
                  {/* optional checkerboard corner */}
                  <div className="absolute -top-16 -right-16 w-[40vmin] h-[40vmin] rotate-6
                                bg-[length:16px_16px]
                                bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)]
                                [background-position:0_0,0_8px,8px_-8px,-8px_0]
                                opacity-[0.06] pointer-events-none" />

                  <div className="mx-auto max-w-6xl px-6 py-20 grid gap-10 md:grid-cols-[1.2fr_.8fr] items-center">
                    <div className="border-2 border-foreground bg-card shadow-brutal p-8 rounded-sm">
                      <h1 className="text-4xl md:text-6xl font-extrabold leading-[0.95]">
                        Neo-Brutalist Arcade <span className="text-primary">Chat</span> UI
                      </h1>
                      <p className="mt-4 text-lg text-muted-foreground">
                        Blocky layouts, thick borders, offset shadows, neon accents—dialed for pixel art vibes.
                      </p>
                      <div className="mt-8 flex flex-wrap gap-4">
                        <a className="border-2 border-foreground bg-accent text-accent-foreground px-5 py-3 shadow-brutal uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-none rounded-sm">
                          Get Started
                        </a>
                        <a className="border-2 border-foreground px-5 py-3 shadow-brutal hover:bg-secondary hover:text-secondary-foreground uppercase tracking-wide rounded-sm">
                          View Projects
                        </a>
                      </div>
                    </div>

                    {/* Projects rail with neo‑brutalist pixel/arcade placeholders */}
                    <aside className="space-y-4">
                      {/* Card 01: Space invader sprite sheet */}
                      <div className="border-2 border-foreground p-1 shadow-brutal rounded-sm bg-card">
                        <div
                          className="relative w-full overflow-hidden border-2 border-foreground rounded-sm"
                          style={{
                            aspectRatio: '16 / 10',
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 0H0V10' fill='none' stroke='%23000000' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23121212'/%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' opacity='0.3'/%3E%3Cg transform='translate(80,40) scale(4)' fill='%2300E5FF'%3E%3Cpath d='M2 0h2v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1H7v1H5v-1H4v1H2v-1H1v-1H0v-1h1V4h1V3h1V2h1V1h1z'/%3E%3C/g%3E%3C/svg%3E\")",
                            imageRendering: 'pixelated'
                          }}
                        >
                          <div className="absolute right-2 top-2 bg-secondary text-secondary-foreground border-2 border-foreground px-2 py-0.5 text-[10px] font-mono uppercase shadow-brutal">Sprite Sheet</div>
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-primary to-secondary opacity-80" />
                        </div>
                        <div className="flex items-center justify-between px-2 py-1 border-t-2 border-foreground bg-background">
                          <span className="font-mono text-xs">PROJECT-01</span>
                          <span className="flex gap-1">
                            <i className="w-3 h-3 bg-primary inline-block" />
                            <i className="w-3 h-3 bg-secondary inline-block" />
                            <i className="w-3 h-3 bg-accent inline-block" />
                          </span>
                        </div>
                      </div>

                      {/* Card 02: Scanline arcade marquee */}
                      <div className="border-2 border-foreground p-1 shadow-brutal rounded-sm bg-card">
                        <div
                          className="relative w-full overflow-hidden border-2 border-foreground rounded-sm"
                          style={{
                            aspectRatio: '16 / 10',
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Cdefs%3E%3ClinearGradient id='mar' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%230057FF'/%3E%3Cstop offset='1' stop-color='%23FF2E88'/%3E%3C/linearGradient%3E%3Cpattern id='scan' width='2' height='2' patternUnits='userSpaceOnUse'%3E%3Crect y='1' width='2' height='1' fill='%23000000'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23mar)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23scan)' opacity='0.35'/%3E%3C/svg%3E\")",
                            imageRendering: 'pixelated'
                          }}
                        >
                          <div className="absolute left-2 bottom-2 bg-primary text-primary-foreground border-2 border-foreground px-2 py-0.5 text-[10px] font-mono uppercase shadow-brutal">Arcade Marquee</div>
                          <div className="absolute inset-y-0 left-1 w-1 bg-accent opacity-80" />
                        </div>
                        <div className="flex items-center justify-between px-2 py-1 border-t-2 border-foreground bg-background">
                          <span className="font-mono text-xs">PROJECT-02</span>
                          <span className="flex gap-1">
                            <i className="w-3 h-3 bg-primary inline-block" />
                            <i className="w-3 h-3 bg-secondary inline-block" />
                            <i className="w-3 h-3 bg-accent inline-block" />
                          </span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </section>

                {/* CHAT CANVAS (sample) */}
                <section className="mx-auto max-w-6xl px-6 py-12 grid gap-6 md:grid-cols-[280px_1fr]">
                  {/* Profile rail */}
                  <div className="border-2 border-foreground bg-card shadow-brutal p-4 rounded-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full ring-4 ring-accent overflow-hidden bg-[#ddd]">
                        <Image
                          src="/avatar.jpg"
                          alt="You"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTYnIGhlaWdodD0nNTYnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzU2JyBoZWlnaHQ9JzU2JyBmaWxsPScjZGRkJy8+PC9zdmc+"
                          priority
                        />
                      </div>
                      <div>
                        <div className="font-bold">Your Name</div>
                        <div className="text-xs text-muted-foreground">@username</div>
                      </div>
                    </div>
                  </div>

                  {/* Chat panel */}
                  <div className="border-2 border-foreground bg-card shadow-brutal p-4 rounded-sm">
                    <div className="space-y-3">
                      <div className="max-w-[70%] border-2 border-foreground bg-background shadow-brutal p-3 rounded-sm">
                        Hi! How can I help you today?
                      </div>
                      <div className="max-w-[70%] ml-auto border-2 border-foreground bg-primary text-primary-foreground shadow-brutal p-3 rounded-sm">
                        Show me the palette options!
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input className="flex-1 border-2 border-foreground bg-background px-3 py-2 focus:outline-none rounded-sm" placeholder="Type your message..." />
                      <button className="border-2 border-foreground bg-secondary text-secondary-foreground px-4 py-2 shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none rounded-sm">Send</button>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              // CLASSIC MODE: Classic landing without top banner
              <div className="min-h-screen w-full bg-[#7566c9] overflow-hidden relative flex flex-col">
                {/* Cloud hint to encourage trying moon cursor */}
                <CloudHint />
                {/* Top moving checkered banner (original) */}
                <div className="relative w-full overflow-hidden h-[15vh]">
                  <div
                    className="absolute inset-0 w-[180%] bg-checker4x2 transform-gpu -translate-x-[25%]"
                    aria-hidden="true"
                  />
                </div>
                {/* Middle content area */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-white text-center">
                    <BouncingText text="NISHIT CHOUHAN" />
                    <PressStart />
                    <TestGif />
                  </div>
                </div>
                {/* Bottom checkered banner with running character */}
                <div className="relative w-full overflow-hidden h-[48vh] md:h-[44vh] lg:h-[40vh]">
                  <RunningCharacter />
                  <div
                    className="absolute bottom-0 left-0 h-full w-[180%] bg-checker-neo-reverse transform-gpu -translate-x-[25%]"
                    style={{
                      transformOrigin: 'bottom center',
                      transform: `perspective(800px) rotateX(50deg) translateY(${bannerTranslateY})`,
                      transformStyle: 'preserve-3d',
                      animationPlayState: pauseBanner ? 'paused' : 'running',
                      animationDuration: `${bannerDurationSec}s`
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="overlay">AV-1</div>
        </div>
      </main>
    </>
  );
}
