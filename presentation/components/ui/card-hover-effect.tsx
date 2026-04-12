import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, DollarSign } from "lucide-react";
import { StarRating } from "@/components/star-rating";

import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    image?: string;
    category?: string;
    rating?: number;
    reviews?: number;
    location?: string;
    priceLevel?: number;
    tags?: string[];
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-black dark:bg-slate-800/[0.8] block  rounded-3xl"
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
          <Card>
            {item.image && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {item.category && (
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {item.category}
              </p>
            )}
            <CardTitle>{item.title}</CardTitle>
            
            {/* Rating Row */}
            {item.rating !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={item.rating} size="sm" />
                <span className="text-sm font-semibold text-zinc-900">{item.rating}</span>
                {item.reviews !== undefined && (
                  <span className="text-sm text-zinc-500">({item.reviews} reviews)</span>
                )}
              </div>
            )}

            {/* Location & Price Row */}
            <div className="flex items-center justify-between mt-3 text-sm text-zinc-500">
              {item.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
              )}
              
              {item.priceLevel && (
                <div className="flex items-center" aria-label={`Price level ${item.priceLevel}`}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <DollarSign
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < item.priceLevel! ? "text-emerald-600" : "text-zinc-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tags Row */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-2 overflow-hidden bg-white border border-black dark:border-white/[0.2] relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-2">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-900 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-8 text-zinc-600 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
