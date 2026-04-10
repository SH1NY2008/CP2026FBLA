
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-6 bg-card/80 border border-border rounded-full px-8 py-4 shadow-lg backdrop-blur-md">
        <Link href="/" className="font-black text-xl text-foreground tracking-tight">
          BOOST
        </Link>
        
        <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
          Browse
        </Link>
        <Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors">
          Deals
        </Link>
        <Link href="/bookmarks" className="text-muted-foreground hover:text-foreground transition-colors">
          Bookmarks
        </Link>
        
        <Link href="/login">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </nav>
    </header>
  );
}
