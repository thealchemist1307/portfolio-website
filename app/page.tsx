// app/page.tsx
"use client";
import { motion } from "framer-motion";
import TestGif from './test-gif';
import BouncingText from './components/BouncingText';
import RunningCharacter from './components/RunningCharacter';

const text = "N I S H I T  C H O U H A N";

export default function LandingPage() {
  return (
    <div className="h-screen bg-[#7566c9] overflow-hidden relative flex flex-col">
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
          <TestGif />
        </div>
      </div>
      
      {/* Bottom checkered banner with running character */}
      <div className="relative h-[40vh] w-full overflow-hidden">
      <RunningCharacter />
        <div
          className="absolute bottom-0 left-0 h-full w-[150%] bg-checker6x2-reverse transform-gpu -translate-x-[20%]"
          style={{ 
            transformOrigin: 'bottom center',
            transform: 'perspective(800px) rotateX(50deg)',
            transformStyle: 'preserve-3d'
          }}
          aria-hidden="true"
        />
        
      </div>
    </div>
  );
}
