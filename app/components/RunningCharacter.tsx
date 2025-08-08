"use client";
import { useEffect, useRef, useState } from 'react';
import styles from './RunningCharacter.module.css';

interface CursorPosition {
  x: number;
  isMoon: boolean;
}

export default function RunningCharacter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isDead, setIsDead] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const directionRef = useRef(1);
  const speed = 2;
  const deathStateRef = useRef({
    position: { x: 0, y: 0 },
    direction: 1,
    isDying: false
  });

  // Handle cursor position updates
  useEffect(() => {
    const handleCursorUpdate = (e: CustomEvent<CursorPosition>) => {
      const character = characterRef.current;
      const container = containerRef.current;
      if (!character || !container) return;
      
      const wasDead = isDead;
      const nowDead = e.detail.isMoon;
      
      // If transitioning from sun to moon and not already dead, trigger death
      if (nowDead && !wasDead) {
        // Store current position and direction before dying
        const rect = character.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeX = rect.left - containerRect.left + rect.width / 2;
        
        deathStateRef.current = {
          position: { x: relativeX, y: rect.bottom - containerRect.bottom },
          direction: directionRef.current,
          isDying: true
        };
        
        setIsDead(true);
      } 
      // If transitioning from moon to sun and was dead, revive
      else if (!nowDead && wasDead) {
        // Reset dying state and restore position
        deathStateRef.current.isDying = false;
        directionRef.current = deathStateRef.current.direction;
        
        // Force reflow to ensure smooth animation
        character.style.animation = 'none';
        character.offsetHeight; // Trigger reflow
        character.style.animation = '';
        
        setIsDead(false);
      }
    };

    window.addEventListener('cursorPosition' as any, handleCursorUpdate as EventListener);
    return () => {
      window.removeEventListener('cursorPosition' as any, handleCursorUpdate as EventListener);
    };
  }, [isDead]);

  // Main animation loop
  useEffect(() => {
    const container = containerRef.current;
    const character = characterRef.current;
    if (!container || !character) return;

    // Use viewport width instead of container width
    const getViewportWidth = () => {
      return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    };
    
    const characterWidth = 86; // Width of the character sprite
    let lastTimestamp = performance.now();
    let viewportWidth = getViewportWidth();
    
    // Handle window resize
    const handleResize = () => {
      viewportWidth = getViewportWidth();
      // Ensure character stays within bounds after resize
      if (positionRef.current.x > viewportWidth - characterWidth) {
        positionRef.current.x = viewportWidth - characterWidth;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize position if coming back from death
    if (deathStateRef.current.position.x > 0 && !deathStateRef.current.isDying) {
      positionRef.current = deathStateRef.current.position;
      // Ensure position is within viewport bounds
      positionRef.current.x = Math.min(positionRef.current.x, viewportWidth - characterWidth);
      character.style.left = `${positionRef.current.x}px`;
      character.style.transform = `scaleX(${deathStateRef.current.direction === -1 ? -1 : 1})`;
    }

    const animate = (timestamp: number) => {
      if (!character) return;
      
      // Skip position updates if we're dead
      if (isDead) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate delta time for smooth animation
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Only update position if enough time has passed (60fps)
      if (deltaTime > 0) {
        // Update position
        const movement = (speed * directionRef.current * deltaTime) / 16;
        positionRef.current.x += movement;
        
        // Instantly wrap around when hitting viewport edges
        const scaledCharacterWidth = characterWidth * 1.75; // Account for the scale transform
        if (positionRef.current.x > viewportWidth) {
          // When going off right edge, instantly appear at left edge
          positionRef.current.x = -scaledCharacterWidth + 1; // Just off left edge
        } else if (positionRef.current.x < -scaledCharacterWidth) {
          // When going off left edge, instantly appear at right edge
          positionRef.current.x = viewportWidth - 1; // Just off right edge
        }
        
        // Update position
        character.style.left = `${positionRef.current.x}px`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update character class based on state
  const characterClasses = [
    styles.knightRun,
    isDead ? styles.dead : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={styles.container}>
      <div 
        ref={characterRef} 
        className={characterClasses}
        style={{
          left: '0',
          transform: `scaleX(${directionRef.current})`,
          zIndex: 30
        }}
      />
    </div>
  );
}
