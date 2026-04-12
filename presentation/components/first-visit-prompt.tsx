'use client';

/**
 * After the splash screen, asks whether this is the user's first visit.
 * Guided tours run only if they answer yes.
 */
import { useApp } from '@/presentation/context/app-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearTourCompletion,
  getRouteIdFromPathname,
} from '@/presentation/lib/page-tours';

export function FirstVisitPrompt() {
  const { firstVisitChoice, setFirstVisitChoice, firstVisitHydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const open = firstVisitHydrated && firstVisitChoice === null;

  const handleYes = () => {
    try {
      /* Legacy key used to migrate into “home complete” and block the tour */
      localStorage.removeItem('boost-app-guided-tour-v1');
      const routeId = getRouteIdFromPathname(pathname);
      if (routeId) {
        clearTourCompletion(routeId);
      }
    } catch {
      /* ignore */
    }

    setFirstVisitChoice('yes');

    /* Navbar tours only exist on specific paths — send users to home so the tour always has a route */
    if (!getRouteIdFromPathname(pathname)) {
      router.push('/');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md z-[300]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>First time here?</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-1">
            Is this your first time visiting Boost? We can show a short guided tour of the site when
            you’re ready.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setFirstVisitChoice('no')}
          >
            No, I’ve been here before
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={handleYes}>
            Yes, show me around
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
