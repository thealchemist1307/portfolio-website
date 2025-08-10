// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TestGif from './test-gif';
import BouncingText from "./components/BouncingText";
import CloudHint from "./components/CloudHint";
import PressStart from "./components/PressStart";
import RunningCharacter from './components/RunningCharacter';

const text = "N I S H I T  C H O U H A N";

export default function LandingPage() {
  const [pauseBanner, setPauseBanner] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

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

  const bp = viewport.w >= 1024 ? 'lg' : viewport.w >= 640 ? 'md' : 'sm';
  const bannerTranslateY = bp === 'lg' ? '5%' : bp === 'md' ? '8%' : '10%';
  // Match banner scroll speed with character horizontal speed (~125px/s)
  // After increasing character scale, the perceived ground speed changed due to banner height (vh) and perspective.
  // We tune a breakpoint-based factor tied to viewport height for better visual sync.
  const characterSpeedPxPerSec = 125; // from RunningCharacter.tsx (speed=2; 2/16 * 1000)
  const heightFactor = bp === 'lg' ? 0.46 : bp === 'md' ? 0.50 : 0.54; // slight per-bp foreshortening differences
  const bannerDurationSec = Math.max(1.0, Math.min(10, (heightFactor * viewport.h) / characterSpeedPxPerSec));

  return (
    <div className="h-screen bg-[#7566c9] overflow-hidden relative flex flex-col">
      {/* Cloud hint to encourage trying moon cursor */}
      <CloudHint />
      {/* Top checkered banner */}
      <div
        className="h-[15vh] w-full bg-checker4x2"
        aria-hidden="true"
      />
      
      {/* Middle content area */}
      <div className="flex-1 flex items-center justify-center">
        {/* Your main content will go here */}
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
          className="absolute bottom-0 left-0 h-full w-[180%] bg-checker6x2-reverse transform-gpu -translate-x-[25%]"
          style={{ 
            transformOrigin: 'bottom center',
            transform: `perspective(800px) rotateX(50deg) translateY(${bannerTranslateY})`,
            transformStyle: 'preserve-3d',
            // Pause/resume banner animation when moon/sun cursor is active
            animationPlayState: pauseBanner ? 'paused' : 'running',
            // Dynamically adjust duration so the banner scrolls at ~character speed across screen sizes
            animationDuration: `${bannerDurationSec}s`
          }}
          aria-hidden="true"
        />
        
      </div>
    </div>
  );
}
