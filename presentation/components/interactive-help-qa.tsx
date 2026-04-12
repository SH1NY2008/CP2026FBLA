'use client';

/**
 * Interactive Q&A: type a natural question and we pick the closest answer by keyword / text overlap.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findBestHelpMatch, type HelpQAEntry } from '@/lib/help-qa-data';
import { cn } from '@/lib/utils';

export function InteractiveHelpQA({ compact = false }: { compact?: boolean }) {
  const [freeQuestion, setFreeQuestion] = useState('');
  const [smartAnswer, setSmartAnswer] = useState<HelpQAEntry | null>(null);
  const [smartNone, setSmartNone] = useState(false);

  const runSmartMatch = () => {
    const best = findBestHelpMatch(freeQuestion);
    setSmartAnswer(best);
    setSmartNone(!best);
  };

  return (
    <div className={cn(compact ? 'space-y-4' : 'space-y-6')}>
      <div
        className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-3"
        data-testid="help-smart-qa"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          Ask a question
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Type in your own words — we&apos;ll match the closest answer from our guide.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={freeQuestion}
            onChange={(e) => {
              setFreeQuestion(e.target.value);
              setSmartNone(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runSmartMatch())}
            placeholder='e.g. "How do I save a coupon?"'
            className="rounded-xl flex-1"
          />
          <Button type="button" variant="secondary" className="rounded-xl shrink-0" onClick={runSmartMatch}>
            Find answer
          </Button>
        </div>
        {smartAnswer && (
          <div className="rounded-xl bg-secondary/50 border border-border/50 p-4 text-sm">
            <p className="font-semibold text-foreground mb-1">{smartAnswer.question}</p>
            <p className="text-muted-foreground leading-relaxed">{smartAnswer.answer}</p>
          </div>
        )}
        {smartNone && freeQuestion.trim().length > 0 && (
          <p className="text-xs text-muted-foreground">
            No close match — try rephrasing, or use Browse / Explore / Deals from the menu.
          </p>
        )}
      </div>
    </div>
  );
}
