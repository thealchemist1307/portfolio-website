"use client";

import { useEffect } from 'react';

export default function ChatPage() {
  useEffect(() => {
    // Add a class so global CSS (if any) can respond to chat mode
    document.documentElement.classList.add('chat-mode');
    // Disable custom cursors (sun/moon) at runtime
    try {
      (window as any).__disableCustomCursor = true;
      window.dispatchEvent(new CustomEvent('customCursorToggle' as any, { detail: { enabled: false } }));
      window.dispatchEvent(new CustomEvent('cursorMode' as any, { detail: { mode: 'none' } }));
    } catch {}
    return () => document.documentElement.classList.remove('chat-mode');
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: `'Press Start 2P', cursive`,
        letterSpacing: '0.06em',
      }}
    >
      Hello World
      <style jsx global>{`
        /* On chat route: default cursor and no animations */
        html, body, #__next, main { cursor: auto !important; }
        * { animation: none !important; transition: none !important; animation-play-state: paused !important; }
        /* Hide any custom cursor overlays if they exist */
        .moonCursor, .sunCursor, .customCursor, .cursor, .cursor-container,
        [data-cursor], #moon-cursor, #sun-cursor { display: none !important; }
        /* Also ensure pointer events don't resurrect hidden cursors */
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
