
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
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[calc(100vw-2rem)]">
      <nav className="flex items-center gap-1 sm:gap-2 bg-card/70 border border-border/60 rounded-full px-4 sm:px-6 py-2.5 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <Link href="/" className="font-black text-lg text-foreground tracking-tight mr-2 sm:mr-4 shrink-0">
          BOOST
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50">
            Browse
          </Link>
          <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50">
            Deals
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50">
            Dashboard
          </Link>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1 sm:mx-2 shrink-0" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="text-xs font-semibold">{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {user.displayName && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground font-medium">
                  {user.displayName}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut(auth)}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm h-8 px-3 rounded-full">Sign In</Button>
            </Link>
            <MovingBorderButton
              as={Link}
              href="/signup"
              borderRadius="9999px"
              containerClassName="h-8 min-w-[4.75rem] w-auto text-sm"
              className="min-h-0 h-8 border border-neutral-200/80 bg-white text-neutral-950 shadow-none backdrop-blur-none hover:bg-neutral-100 hover:text-neutral-950 px-3.5 py-0 text-sm font-medium dark:border-neutral-300/50"
            >
              Sign Up
            </MovingBorderButton>
          </div>
        )}
      </nav>
    </header>
  );
}
