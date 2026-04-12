"use client"

import React from "react"

/**
 * Star Rating Component
 * 
 * Displays star ratings with support for half-stars and interactive selection.
 * Fully accessible with keyboard navigation and screen reader support.
 * 
 * @module StarRating
 */

import { useState } from "react"
import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

/**
 * Star Rating Display and Input Component
 * Supports half-star precision and keyboard interaction
 * 
 * @param rating - Current rating value (0-5)
 * @param maxRating - Maximum rating (default 5)
 * @param size - Size variant (sm, md, lg)
 * @param interactive - Enable user rating selection
 * @param onChange - Callback when rating changes
 * @param showValue - Display numeric value next to stars
 * @param className - Additional CSS classes
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [focusRating, setFocusRating] = useState<number | null>(null)

  const displayRating = hoverRating ?? focusRating ?? rating

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (!interactive) return

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick(value)
    } else if (e.key === "ArrowRight" && onChange) {
      e.preventDefault()
      const newRating = Math.min(rating + 0.5, maxRating)
      onChange(newRating)
    } else if (e.key === "ArrowLeft" && onChange) {
      e.preventDefault()
      const newRating = Math.max(rating - 0.5, 0.5)
      onChange(newRating)
    }
  }

  const renderStar = (index: number) => {
    const starValue = index + 1
    const halfValue = index + 0.5

    const isFilled = displayRating >= starValue
    const isHalfFilled = !isFilled && displayRating >= halfValue

    return (
      <span
        key={index}
        className={cn(
          "relative inline-flex",
          interactive && "cursor-pointer"
        )}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        onClick={() => handleClick(starValue)}
        onKeyDown={(e) => handleKeyDown(e, starValue)}
        onFocus={() => interactive && setFocusRating(starValue)}
        onBlur={() => interactive && setFocusRating(null)}
        tabIndex={interactive ? 0 : -1}
        role={interactive ? "button" : "presentation"}
        aria-label={interactive ? `Rate ${starValue} stars` : undefined}
      >
        {/* Half star click target */}
        {interactive && (
          <span
            className="absolute left-0 top-0 h-full w-1/2 z-10"
            onMouseEnter={(e) => {
              e.stopPropagation()
              setHoverRating(halfValue)
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleClick(halfValue)
            }}
            aria-hidden="true"
          />
        )}

        {/* Star icon */}
        {isHalfFilled ? (
          <span className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground/30"
              )}
              fill="currentColor"
            />
            <StarHalf
              className={cn(
                sizeClasses[size],
                "absolute left-0 top-0 text-amber-400"
              )}
              fill="currentColor"
            />
          </span>
        ) : (
          <Star
            className={cn(
              sizeClasses[size],
              isFilled ? "text-amber-400" : "text-muted-foreground/30",
              interactive && "transition-colors duration-150"
            )}
            fill="currentColor"
          />
        )}
      </span>
    )
  }

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={!interactive ? "img" : undefined}
      aria-label={!interactive ? `Rating: ${rating} out of ${maxRating} stars` : undefined}
    >
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
