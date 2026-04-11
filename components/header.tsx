
'use client';

import { Button } from '@/components/ui/button';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import Link from 'next/link';
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
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
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
            <MovingBorderButton
              as={Link}
              href="/signup"
              borderRadius="9999px"
              containerClassName="h-9 min-w-[5.75rem] w-auto text-sm"
              className="min-h-0 h-9 border border-neutral-200/80 bg-white text-neutral-950 shadow-none backdrop-blur-none hover:bg-neutral-100 hover:text-neutral-950 px-4 py-0 text-sm font-medium dark:border-neutral-300/50"
            >
              Sign Up
            </MovingBorderButton>
          </>
        )}
      </nav>
    </header>
  );
}
