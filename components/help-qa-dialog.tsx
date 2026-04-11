'use client';

/* Header entry point: full interactive Q&A in a dialog so users don’t leave their current page. */
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InteractiveHelpQA } from '@/components/interactive-help-qa';

export function HelpQADialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground gap-1.5"
          aria-label="Open help and Q&A"
        >
          <CircleHelp className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-left">Help &amp; answers</DialogTitle>
        </DialogHeader>
        <InteractiveHelpQA compact />
      </DialogContent>
    </Dialog>
  );
}
