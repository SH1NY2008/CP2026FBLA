"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Deal, Business } from "@/lib/data";
import { DealCard } from "@/components/deal-card";

export const DealsGrid = ({
  deals,
  businesses,
  className,
}: {
  deals: Deal[];
  businesses: Business[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {deals.map((deal, idx) => {
        const business = businesses.find((b) => b.id === deal.businessId);
        if (!business) return null;

        return (
          <div
            key={deal.id}
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <div className="relative z-20 h-full">
              <DealCard
                deal={deal}
                business={business}
                className="h-full w-full rounded-2xl border border-black/10 dark:border-white/[0.2] bg-white dark:bg-black p-4 shadow-none hover:shadow-none hover:translate-y-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
