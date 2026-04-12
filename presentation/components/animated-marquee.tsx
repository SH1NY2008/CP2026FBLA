
import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  fade?: boolean;
  direction?: "left" | "right" | "up" | "down";
  speed?: "slow" | "normal" | "fast";
  children?: React.ReactNode;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      pauseOnHover = false,
      reverse = false,
      fade = false,
      direction = "left",
      speed = "normal",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex min-w-full shrink-0 items-center justify-around [animation-play-state:running]",
            {
              "animate-marquee-left": direction === "left",
              "animate-marquee-right": direction === "right",
              "animate-marquee-up": direction === "up",
              "animate-marquee-down": direction === "down",
              "hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
              "duration-slow": speed === "slow",
              "duration-normal": speed === "normal",
              "duration-fast": speed === "fast",
            }
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

Marquee.displayName = "Marquee";

export { Marquee as AnimatedMarquee };
