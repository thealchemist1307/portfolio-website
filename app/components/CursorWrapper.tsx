// app/components/CursorWrapper.tsx
'use client';
import AnimatedCursor from './AnimatedCursor';
import { usePathname } from 'next/navigation';

export default function CursorWrapper() {
  const pathname = usePathname();
  const isChat = pathname?.startsWith('/chat');
  if (isChat) return null;
  return <AnimatedCursor />;
}
