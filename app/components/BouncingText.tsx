'use client';

import { useEffect, useState } from 'react';
import styles from './BouncingText.module.css';

interface BouncingTextProps {
  text: string;
}

const BouncingText: React.FC<BouncingTextProps> = ({ text }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Split the text into first and last name parts
  const [firstName, lastName] = text.split(' ');
  
  // Set up effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // 1024px is typically the breakpoint for 'lg' screens
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // For large screens, render the arc
  if (isLargeScreen) {
    const letters = text.split('');
    const numLetters = letters.length;
    const radius = 300;
    const arc = 140;
    const anglePerLetter = arc / (numLetters - 1);
    
    return (
      <div className={styles.arcContainer}>
        {letters.map((char, index) => (
          <div
            key={index}
            className={styles.letterWrapper}
            style={{
              transform: `rotate(${(index - (numLetters - 1) / 2) * anglePerLetter}deg) translateY(-${radius}px)`,
            }}
          >
            <span 
              className={`${styles.letter} ${styles.arcLetter}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          </div>
        ))}
      </div>
    );
  }
  
  // For small/medium screens, render stacked text
  return (
    <div className={styles.stackedContainer}>
      <div className={styles.nameLine}>
        {firstName.split('').map((char, index) => (
          <span 
            key={`first-${index}`}
            className={`${styles.letter} ${styles.stackedLetter}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {char}
          </span>
        ))}
      </div>
      <div className={styles.nameLine} style={{ marginTop: '1.5rem' }}>
        {lastName.split('').map((char, index) => (
          <span 
            key={`last-${index}`}
            className={`${styles.letter} ${styles.stackedLetter}`}
            style={{ animationDelay: `${(firstName.length + index) * 0.05}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BouncingText;