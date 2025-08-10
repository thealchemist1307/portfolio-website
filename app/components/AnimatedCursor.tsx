'use client';

import { useEffect, useRef, useState } from 'react';

export default function AnimatedCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorImage, setCursorImage] = useState('/cursor/sun3_loading.gif');
  const starsContainerRef = useRef<HTMLDivElement | null>(null);
  const isMoonActive = useRef(false);

  // Dispatch cursor position updates to other components
  const dispatchCursorUpdate = (x: number, windowWidth: number) => {
    const isMoon = x < windowWidth * 0.4;
    const event = new CustomEvent<{ x: number; isMoon: boolean }>('cursorPosition', {
      detail: { x, isMoon }
    });
    window.dispatchEvent(event);
    return isMoon;
  };

  const getCursorImage = (x: number, windowWidth: number) => {
    const isMoon = dispatchCursorUpdate(x, windowWidth);
    return isMoon ? '/cursor/moon3_loading.gif' : '/cursor/sun3_loading.gif';
  };

  // Compute an initial Y position based on responsive breakpoints
  const computeInitialY = (width: number, height: number) => {
    // sm: <640, md: 640-1023, lg: >=1024
    if (width >= 1024) return height * 0.5; // lg: centered
    if (width >= 640) return height * 0.60; // md: a bit lower
    return height * 0.65; // sm: even lower
  };

  const startAnimation = (star: HTMLElement) => {
    const pulseDuration = 2000 + Math.random() * 2000;
    const spinDuration = 5000 + Math.random() * 5000;

    const animate = (timestamp: number) => {
      const pulseProgress = (timestamp % pulseDuration) / pulseDuration;
      const spinProgress = (timestamp % spinDuration) / spinDuration;

      const pulse = 0.8 + Math.sin(pulseProgress * 2 * Math.PI) * 0.2;
      const opacity = 0.7 + Math.sin(pulseProgress * 2 * Math.PI) * 0.3;
      const rotation = spinProgress * 360;

      star.style.transform = `translate(-50%, -50%) scale(${pulse}) rotate(${rotation}deg)`;
      star.style.opacity = `${opacity}`;

      (star as any).animationFrameId = requestAnimationFrame(animate);
    };

    (star as any).animationFrameId = requestAnimationFrame(animate);
  };

  const initializeStars = () => {
    if (!starsContainerRef.current) return;
    const container = starsContainerRef.current;
    const starImages = ['/star1.png', '/star2.png', '/star3.png', '/star4.png'];

    const isLargeScreen = window.innerWidth >= 768;
    const numStars = isLargeScreen ? 30 : 10;
    const gridCols = isLargeScreen ? 6 : 5;
    const gridRows = isLargeScreen ? 5 : 2;

    // 1. Define the exact boundaries of the visible content area.
    const starSize = 30; // The height/width of the star element.
    const contentAreaTop = window.innerHeight * 0.15;
    const contentAreaBottom = window.innerHeight * (1 - 0.2);

    // 2. Define the safe placement area for the *center* of the stars.
    // This is inset from the content area by half the star's size.
    const placementAreaTop = contentAreaTop + (starSize / 2);
    const placementAreaBottom = contentAreaBottom - (starSize / 2);
    const placementAreaHeight = placementAreaBottom - placementAreaTop;

    // 3. Calculate cell dimensions based on the safe placement area.
    const cellWidth = window.innerWidth / gridCols;
    const cellHeight = placementAreaHeight / gridRows;

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.width = `${starSize}px`;
      star.style.height = `${starSize}px`;
      star.style.backgroundImage = `url(${starImages[Math.floor(Math.random() * starImages.length)]})`;
      star.style.backgroundSize = 'contain';
      star.style.backgroundRepeat = 'no-repeat';
      star.style.zIndex = '999998';
      star.style.pointerEvents = 'none';
      star.style.opacity = '0';
      star.style.borderRadius = '50%';

      const row = Math.floor(i / gridCols);
      const col = i % gridCols;

      // 4. Calculate the star's center position within its designated cell in the safe area.
      const x = (col * cellWidth) + (Math.random() * cellWidth);
      const y = placementAreaTop + (row * cellHeight) + (Math.random() * cellHeight);

      star.style.left = `${x}px`;
      star.style.top = `${y}px`;

      container.appendChild(star);
      startAnimation(star);
    }
  };

  const showStars = () => {
    if (starsContainerRef.current) {
      starsContainerRef.current.style.display = 'block';
    }
  };

  const hideStars = () => {
    if (starsContainerRef.current) {
      starsContainerRef.current.style.display = 'none';
    }
  };

  const move = (e: MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    const newCursorImage = getCursorImage(e.clientX, window.innerWidth);
    setCursorImage(newCursorImage);

    const shouldBeMoon = newCursorImage.includes('moon');
    if (shouldBeMoon !== isMoonActive.current) {
      if (shouldBeMoon) {
        showStars();
      } else {
        hideStars();
      }
      isMoonActive.current = shouldBeMoon;
    }
  };

  useEffect(() => {
    // Set initial cursor position responsive to screen size (lower on sm/md)
    const initialX = window.innerWidth / 2;
    const initialY = computeInitialY(window.innerWidth, window.innerHeight);
    setCursorPosition({ x: initialX, y: initialY });
    // Set initial image to ensure sun/moon state is correct before first mouse move
    setCursorImage(getCursorImage(initialX, window.innerWidth));

    const starsContainer = document.createElement('div');
    starsContainer.style.position = 'fixed';
    starsContainer.style.top = '0';
    starsContainer.style.left = '0';
    starsContainer.style.width = '100%';
    starsContainer.style.height = '100%';
    starsContainer.style.pointerEvents = 'none';
    starsContainer.style.zIndex = '999997';
    starsContainer.style.display = 'none';
    document.body.appendChild(starsContainer);
    starsContainerRef.current = starsContainer;

    initializeStars();

    window.addEventListener('mousemove', move);
    // Also update initial position on resize until the user moves the mouse
    const handleResize = () => {
      setCursorPosition(prev => {
        // Only adjust if the cursor hasn't been moved by the user yet (still near center X)
        const nearCenter = Math.abs(prev.x - initialX) < 2 && Math.abs(prev.y - initialY) < 2;
        const x = window.innerWidth / 2;
        const y = computeInitialY(window.innerWidth, window.innerHeight);
        if (nearCenter) {
          setCursorImage(getCursorImage(x, window.innerWidth));
          return { x, y };
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('resize', handleResize);
      if (starsContainerRef.current) {
        const stars = starsContainerRef.current.childNodes;
        stars.forEach(star => {
          if ((star as any).animationFrameId) {
            cancelAnimationFrame((star as any).animationFrameId);
          }
        });
        document.body.removeChild(starsContainerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none"
      style={{
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        backgroundImage: `url(${cursorImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        zIndex: 999999,
        width: '128px',
        height: '128px',
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        cursor: 'none',
      }}
    />
  );
}
