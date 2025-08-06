'use client';

import { useEffect, useRef, useState } from 'react';

export default function AnimatedCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorImage, setCursorImage] = useState('/cursor/sun3_loading.gif'); // Default to sun
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const activeStarsRef = useRef<HTMLDivElement[]>([]);

  // Function to determine which cursor to show based on mouse X position
  const getCursorImage = (x: number, windowWidth: number) => {
    const moonBoundary = windowWidth * 0.40;
    
    if (x < moonBoundary) {
      // Left 40% - Moon cursor
      return '/cursor/moon3_loading.gif';
    } else {
      // Right 60% - Sun cursor
      return '/cursor/sun3_loading.gif';
    }
  };

  const move = (e: MouseEvent) => {
    // Update cursor position through state
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Update cursor image based on mouse position
    const newCursorImage = getCursorImage(e.clientX, window.innerWidth);
    
    // Always update cursor image and handle star visibility on every mouse move
    // to ensure reliable transitions
    setCursorImage(newCursorImage);
    
    // Handle star visibility based on cursor type
    if (newCursorImage.includes('moon')) {
      // Initialize stars on first moon cursor appearance
      if (activeStarsRef.current.length === 0) {
        initializeStars();
      }
      showStars();
    } else {
      hideStars();
    }
  };

  // Function to get max stars based on screen size
  const getMaxStars = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 10 : 4;
    }
    return 4; // Default to 4 stars on server
  };

  // Function to initialize stars (create 10 fixed stars with random positions and images)
  const initializeStars = () => {
    if (!starsContainerRef.current || activeStarsRef.current.length > 0) return;
    
    const starImages = ['/star1.png', '/star2.png', '/star3.png', '/star4.png'];
    
    // Create 10 stars with fixed positions and images
    for (let i = 0; i < 10; i++) {
      // Select a random star image
      const randomStar = starImages[Math.floor(Math.random() * starImages.length)];
      
      // Create star element
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.width = '0px';
      star.style.height = '0px';
      star.style.backgroundImage = `url(${randomStar})`;
      star.style.backgroundSize = 'contain';
      star.style.backgroundRepeat = 'no-repeat';
      star.style.zIndex = '999998';
      star.style.pointerEvents = 'none';
      star.style.opacity = '0';
      star.style.borderRadius = '50%';
      
      // Position star randomly in the middle area
      const topOffset = window.innerHeight * 0.20;
      const bottomOffset = window.innerHeight * 0.45;
      const availableHeight = window.innerHeight - topOffset - bottomOffset;
      
      const randomX = Math.random() * (window.innerWidth - 30);
      const randomY = topOffset + (Math.random() * availableHeight);
      
      star.style.left = `${randomX}px`;
      star.style.top = `${randomY}px`;
      
      // Add to container
      starsContainerRef.current.appendChild(star);
      activeStarsRef.current.push(star);
    }
  };
  
  // Function to show stars with animation
  const showStars = () => {
    if (!starsContainerRef.current || activeStarsRef.current.length === 0) return;
    
    // Make container visible
    if (starsContainerRef.current) {
      starsContainerRef.current.style.display = 'block';
    }
    
    // Animate each star
    activeStarsRef.current.forEach((star, index) => {
      // Add a slight delay for each star for a staggered effect
      setTimeout(() => {
        // Twinkling animation - expand and fade in
        let start: number | null = null;
        const expandDuration = 500; // 500ms for expansion
        
        const animateExpand = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min(1, (timestamp - start) / expandDuration);
          // Ease out function for smooth animation
          const ease = 1 - Math.pow(1 - progress, 3);
          
          const size = ease * 30;
          const opacity = ease;
          
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.opacity = `${opacity}`;
          star.style.marginLeft = `${-size/2}px`;
          star.style.marginTop = `${-size/2}px`;
          
          if (progress < 1) {
            requestAnimationFrame(animateExpand);
          }
        };
        
        requestAnimationFrame(animateExpand);
      }, index * 100); // Stagger the animations
    });
  };
  
  // Function to hide stars with animation
  const hideStars = () => {
    if (!starsContainerRef.current || activeStarsRef.current.length === 0) return;
    
    // Animate each star
    activeStarsRef.current.forEach((star, index) => {
      // Add a slight delay for each star for a staggered effect
      setTimeout(() => {
        // Implode animation - shrink and fade out
        let implodeStart: number | null = null;
        const implodeDuration = 500; // 500ms for implosion
        
        const animateImplode = (timestamp: number) => {
          if (!implodeStart) implodeStart = timestamp;
          const progress = Math.min(1, (timestamp - implodeStart) / implodeDuration);
          // Ease in function for smooth animation
          const ease = 1 - Math.pow(progress, 3);
          
          const size = ease * 30;
          const opacity = ease;
          
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.opacity = `${opacity}`;
          star.style.marginLeft = `${-size/2}px`;
          star.style.marginTop = `${-size/2}px`;
          
          if (progress < 1) {
            requestAnimationFrame(animateImplode);
          }
        };
        
        requestAnimationFrame(animateImplode);
      }, index * 50); // Stagger the animations
    });
    
    // Hide container after all animations complete
    setTimeout(() => {
      if (starsContainerRef.current) {
        starsContainerRef.current.style.display = 'none';
      }
    }, 500 + (activeStarsRef.current.length * 50));
  };

  useEffect(() => {
    // Set mounted state to true
    setIsMounted(true);
    
    // Set initial position to center of screen for visibility
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    setCursorPosition({ x: initialX, y: initialY });
    
    // Set initial cursor image based on initial position
    const initialCursorImage = getCursorImage(initialX, window.innerWidth);
    setCursorImage(initialCursorImage);
    
    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.style.position = 'fixed';
    starsContainer.style.top = '0';
    starsContainer.style.left = '0';
    starsContainer.style.width = '100%';
    starsContainer.style.height = '100%';
    starsContainer.style.pointerEvents = 'none';
    starsContainer.style.zIndex = '999997';
    starsContainer.style.display = 'none'; // Initially hidden
    document.body.appendChild(starsContainer);
    starsContainerRef.current = starsContainer;
    
    // Add event listeners
    window.addEventListener('mousemove', move);
    
    // Clean up function
    return () => {
      // Clean up animation frame
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Clean up stars container
      if (starsContainerRef.current && starsContainerRef.current.parentNode) {
        starsContainerRef.current.parentNode.removeChild(starsContainerRef.current);
      }
      
      // Clean up event listeners
      window.removeEventListener('mousemove', move);
    };
  }, []);

  // Don't render anything on the server
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none"
        style={{ 
          left: cursorPosition.x,
          top: cursorPosition.y,
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
          cursor: 'none'
        }}
      />
      <div 
        ref={starsContainerRef}
        className="fixed pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999998,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}
