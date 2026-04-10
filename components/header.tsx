
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header() {
  const { user } = useAuth();

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
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              {user.displayName && <span>{user.displayName}</span>}
              <Avatar>
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => signOut(auth)}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
