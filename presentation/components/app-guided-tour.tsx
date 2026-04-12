'use client';

/**
 * Per-page guided tours for each navbar route: dims the page, spotlight on key UI.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/presentation/context/app-context';
import {
  completeTourStorage,
  getRouteIdFromPathname,
  getTourStepsForRoute,
  isTourCompleted,
  migrateLegacyTourStorage,
  type TourStep,
} from '@/presentation/lib/page-tours';

const OVERLAY_PAD = 10;
const HIGHLIGHT_CLASS = 'tour-spotlight-target';

function isElementVisible(el: Element): boolean {
  const html = el as HTMLElement;
  if (!html.getClientRects().length) return false;
  const style = window.getComputedStyle(html);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  return html.offsetParent !== null || style.position === 'fixed';
}

function resolveTarget(selectors: string[]): HTMLElement | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && isElementVisible(el)) return el as HTMLElement;
  }
  return selectors.length ? (document.querySelector(selectors[0]) as HTMLElement | null) : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function AppGuidedTour() {
  const pathname = usePathname();
  const routeId = getRouteIdFromPathname(pathname);
  const { firstVisitChoice, firstVisitHydrated } = useApp();

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top?: number; bottom?: number; left: number }>({
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];
  const isLast = steps.length > 0 && stepIndex === steps.length - 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setStepIndex(0);
    setActive(false);
    setHole(null);
    setSteps([]);
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((n) => n.classList.remove(HIGHLIGHT_CLASS));
    document.body.style.overflow = '';
  }, [pathname]);

  /* One-time legacy key migration — must not run inside the “start tour” effect or it marks home complete before the user opts in. */
  useEffect(() => {
    migrateLegacyTourStorage();
  }, []);

  useEffect(() => {
    if (!firstVisitHydrated) return;
    if (firstVisitChoice !== 'yes') return;
    if (!routeId) return;
    if (isTourCompleted(routeId)) return;
    const t = window.setTimeout(() => setActive(true), 450);
    return () => window.clearTimeout(t);
  }, [routeId, pathname, firstVisitChoice, firstVisitHydrated]);

  useLayoutEffect(() => {
    if (!active || !routeId) {
      setSteps([]);
      return;
    }
    const next = getTourStepsForRoute(routeId);
    setSteps(next);
    setStepIndex(0);
  }, [active, routeId]);

  const finish = useCallback(
    (persist: boolean) => {
      setActive(false);
      setStepIndex(0);
      setSteps([]);
      setHole(null);
      document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((n) => n.classList.remove(HIGHLIGHT_CLASS));
      document.body.style.overflow = '';
      if (persist && routeId) {
        completeTourStorage(routeId);
      }
    },
    [routeId],
  );

  const applyStepLayout = useCallback(() => {
    if (!step) return;
    const selectors = step.selectors;
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((n) => n.classList.remove(HIGHLIGHT_CLASS));

    if (!selectors.length) {
      setHole(null);
      const w = window.innerWidth;
      setTooltipPos({
        left: clamp(w / 2 - 192, 16, w - 384 - 16),
        top: Math.max(120, window.innerHeight * 0.18),
      });
      return;
    }

    const el = resolveTarget(selectors);
    if (!el) {
      setHole(null);
      const w = window.innerWidth;
      setTooltipPos({
        left: clamp(w / 2 - 192, 16, w - 384 - 16),
        top: Math.max(100, window.innerHeight * 0.2),
      });
      return;
    }

    el.classList.add(HIGHLIGHT_CLASS);

    const r = el.getBoundingClientRect();
    const x = r.left - OVERLAY_PAD;
    const y = r.top - OVERLAY_PAD;
    const w = r.width + OVERLAY_PAD * 2;
    const h = r.height + OVERLAY_PAD * 2;
    setHole({ x, y, w, h });

    const tooltipW = 384;
    const margin = 16;
    const estH = 220;
    const left = clamp(r.left + r.width / 2 - tooltipW / 2, margin, window.innerWidth - tooltipW - margin);

    const spaceBelow = window.innerHeight - r.bottom;
    if (spaceBelow > estH + margin || r.top < estH) {
      setTooltipPos({ left, top: Math.min(r.bottom + margin, window.innerHeight - estH - margin) });
    } else {
      setTooltipPos({
        left,
        bottom: Math.min(window.innerHeight - r.top + margin, window.innerHeight - margin),
      });
    }
  }, [step]);

  useLayoutEffect(() => {
    if (!active || !step) return;
    const selectors = step.selectors;
    if (selectors.length) {
      const el = resolveTarget(selectors);
      el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
    applyStepLayout();
  }, [active, stepIndex, step, applyStepLayout]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => applyStepLayout();
    const onScroll = () => applyStepLayout();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [active, applyStepLayout]);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-tour-action="next"]')?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [active, stepIndex]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, finish]);

  const goNext = () => {
    if (isLast) finish(true);
    else setStepIndex((i) => i + 1);
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  if (!mounted || !active || !routeId || !steps.length || !step) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  let pathD = '';
  if (hole && vw && vh) {
    const { x, y, w, h } = hole;
    pathD = `M0,0 H${vw} V${vh} H0 Z M${x},${y} h${w} v${h} h${-w} Z`;
  } else if (vw && vh) {
    pathD = `M0,0 H${vw} V${vh} H0 Z`;
  }

  const portal = (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <svg
        className="fixed inset-0 h-full w-full pointer-events-auto"
        role="presentation"
        aria-hidden
      >
        <path d={pathD} fill="rgba(0,0,0,0.72)" fillRule="evenodd" className="pointer-events-auto" />
      </svg>

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-body"
        className="pointer-events-auto fixed z-[201] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-md"
        style={{
          left: tooltipPos.left,
          ...(tooltipPos.top !== undefined ? { top: tooltipPos.top } : {}),
          ...(tooltipPos.bottom !== undefined ? { bottom: tooltipPos.bottom } : {}),
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Guided tour · {stepIndex + 1} / {steps.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 -mr-1 -mt-1"
            onClick={() => finish(true)}
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h2 id="tour-step-title" className="text-lg font-bold leading-snug mb-2">
          {step.title}
        </h2>
        <p id="tour-step-body" className="text-sm text-muted-foreground leading-relaxed mb-5">
          {step.body}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => finish(true)}
            className="text-muted-foreground"
          >
            Skip tour
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              data-tour-action="next"
              onClick={goNext}
              className="gap-1"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(portal, document.body);
}
