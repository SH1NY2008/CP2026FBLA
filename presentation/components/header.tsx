'use client';

/* Global top bar: same on every page — nav links, auth dropdown or sign-in, mobile sheet. */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { HelpQADialog } from '@/components/help-qa-dialog';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Browse', href: '/browse' },
  { label: 'Explore', href: '/explore' },
  { label: 'Deals', href: '/deals' },
  { label: 'Trip Planner', href: '/trip-planner' },
  { label: 'Portal', href: '/portal' },
  { label: 'Accessibility', href: '/accessibility' },
];

export function Header() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 border-b border-border/40 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto relative flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link
          href="/"
          data-tour="tour-logo"
          className="font-black text-xl text-foreground tracking-tight shrink-0 z-10"
        >
          BOOST
        </Link>

        {/* Desktop nav — centered in the bar; logo left, actions right */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:flex md:justify-center">
          <div
            data-tour="tour-main-nav"
            className="pointer-events-auto flex items-center gap-0.5 lg:gap-1"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2 rounded-full hover:bg-secondary/60 lg:px-3"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto z-10">
          {/* Interactive Q&A from any page; /help has the full layout */}
          <HelpQADialog />

          {/* Desktop auth + mobile menu — one spotlight for “your account” on all breakpoints */}
          <div data-tour="tour-account" className="flex items-center gap-1 sm:gap-2">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center justify-end gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback className="text-xs font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
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
                <DropdownMenuItem asChild>
                  <Link href="/explore">AI Explorer</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trip-planner">Trip Planner</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal">Business Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut(auth)}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm h-9 px-4 rounded-full text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="text-sm h-9 px-5 rounded-full !bg-white !text-black hover:!bg-white/90 !border-0 !shadow-none"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          </div>

          {/* Mobile menu toggle */}
          <button
            data-tour="tour-mobile-menu"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl px-6 py-5 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 border-b border-border/30 last:border-0"
            >
              {label}
            </Link>
          ))}

          <div className="flex gap-3 mt-4 pt-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
              <Button variant="outline" className="w-full rounded-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
              <Button className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
