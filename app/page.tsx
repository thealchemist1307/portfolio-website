// app/page.tsx
"use client";
import { motion } from "framer-motion";
import TestGif from './test-gif';

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
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-xl">Portfolio content goes here</p>
          <TestGif />
        </div>
      </div>
      
      {/* Bottom checkered banner (reverse direction) - 25vh with perspective - 6 rows */}
      <div
        className="h-[40vh] w-[150%] bg-checker6x2-reverse transform-gpu -translate-x-[20%]"
        style={{ 
          transformOrigin: 'bottom center',
          transform: 'perspective(800px) rotateX(50deg)',
          transformStyle: 'preserve-3d'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
