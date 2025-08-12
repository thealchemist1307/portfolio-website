// app/components/CursorWrapper.tsx
'use client';
import AnimatedCursor from './AnimatedCursor';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CursorWrapper() {
  const pathname = usePathname();
  const isChat = pathname?.startsWith('/chat');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (isChat || !mounted) return null;
  return <AnimatedCursor />;
}
