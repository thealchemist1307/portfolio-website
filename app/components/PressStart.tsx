"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PressStart.module.css";

export default function PressStart() {
  const [seenMoonOnce, setSeenMoonOnce] = useState(false);
  const [bp, setBp] = useState<'sm' | 'md' | 'lg'>('sm');
  const router = useRouter();

  useEffect(() => {
    const onCursor = (e: any) => {
      const isMoon = !!e?.detail?.isMoon;
      if (isMoon && !seenMoonOnce) {
        setSeenMoonOnce(true);
      }
    };
    window.addEventListener('cursorPosition' as any, onCursor as EventListener);
    return () => window.removeEventListener('cursorPosition' as any, onCursor as EventListener);
  }, [seenMoonOnce]);

  useEffect(() => {
    const update = () => {
      const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      setBp(w >= 1024 ? 'lg' : w >= 640 ? 'md' : 'sm');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Render always so navigation is available regardless of moon state

  const sizeClass = bp === 'lg' ? styles.large : bp === 'md' ? styles.medium : styles.small;

  const onActivate = () => {
    // Ensure cursor becomes visible again after we leave this page
    try { document.documentElement.classList.remove('hide-cursor'); } catch {}
    // Simple redirect to /chat for now
    router.push('/chat');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  const onHoverStart = () => {
    try { document.documentElement.classList.add('hide-cursor'); } catch {}
  };
  const onHoverEnd = () => {
    try { document.documentElement.classList.remove('hide-cursor'); } catch {}
  };

  return (
    <div
      className={`${styles.container} ${bp === 'lg' ? styles.fixedLg : ''}`}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={onKey}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div className={`${styles.prompt} ${sizeClass}`}>PRESS START</div>
    </div>
  );
}
