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

    const containerWidth = container.offsetWidth;
    const characterWidth = 86; // Width of the character sprite
    let lastTimestamp = performance.now();
    
    // Initialize position if coming back from death
    if (deathStateRef.current.position.x > 0 && !deathStateRef.current.isDying) {
      positionRef.current = deathStateRef.current.position;
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
        
        // Change direction when hitting container edges
        if (positionRef.current.x > containerWidth) {
          directionRef.current = -1;
          character.style.transform = 'scaleX(-1)';
        } else if (positionRef.current.x < 0) {
          directionRef.current = 1;
          character.style.transform = 'scaleX(1)';
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
