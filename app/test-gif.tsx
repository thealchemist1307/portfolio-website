'use client';

import React, { useEffect } from 'react';

export default function TestGif() {
  useEffect(() => {
    console.log('TestGif component mounted');
    
    // Test if the GIF is accessible
    const img = new Image();
    img.onload = () => {
      console.log('GIF loaded successfully');
    };
    img.onerror = () => {
      console.log('Failed to load GIF');
    };
    img.src = '/cursor/sun3_loading.gif';
  }, []);

  return (
    <div>
    </div>
  );
}
