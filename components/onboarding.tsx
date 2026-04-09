"use client"

/**
 * Onboarding Overlay Component
 * 
 * Step-by-step tutorial for first-time users explaining
 * key features of the application.
 * 
 * @module Onboarding
 */

import { useState } from "react"
import {
  Search,
  Star,
  Bookmark,
  Tag,
  BarChart3,
  ArrowRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useApp } from "@/lib/context"
import { cn } from "@/lib/utils"

/**
 * Onboarding step configuration
 */
const steps = [
  {
    icon: Search,
    title: "Discover Local Businesses",
    description:
      "Search and browse local small businesses by category, location, or name. Use filters to find exactly what you are looking for.",
    color: "bg-blue-500",
  },
  {
    icon: Star,
    title: "Read & Write Reviews",
    description:
      "See what others think and share your own experiences. Rate businesses from 1-5 stars and help others make informed decisions.",
    color: "bg-amber-500",
  },
  {
    icon: Bookmark,
    title: "Save Your Favorites",
    description:
      "Bookmark businesses you love and organize them into custom folders. Add personal notes to remember why you saved them.",
    color: "bg-emerald-500",
  },
  {
    icon: Tag,
    title: "Find Exclusive Deals",
    description:
      "Discover special offers and discounts from local businesses. Get promo codes and save money while supporting your community.",
    color: "bg-orange-500",
  },

]

interface OnboardingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Onboarding Dialog Component
 * Shows interactive tutorial for new users
 * 
 * @param open - Whether dialog is open
 * @param onOpenChange - Callback when open state changes
 */
export function Onboarding({ open, onOpenChange }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { completeOnboarding } = useApp()

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  /**
   * Advances to next step or completes onboarding
   */
  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
      onOpenChange(false)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  /**
   * Skips onboarding entirely
   */
  const handleSkip = () => {
    completeOnboarding()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Welcome Tutorial</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="ml-auto -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
            >
              Skip
              <X className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex flex-col items-center text-center py-6">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full mb-6",
              step.color
            )}
          >
            <Icon className="h-8 w-8 text-white" aria-hidden="true" />
          </div>

          {/* Title & Description */}
          <h2 className="text-xl font-semibold mb-2 text-balance">{step.title}</h2>
          <DialogDescription className="text-muted-foreground text-pretty">
            {step.description}
          </DialogDescription>
        </div>

        {/* Progress Dots */}
        <div
          className="flex items-center justify-center gap-2 mb-4"
          role="tablist"
          aria-label="Tutorial progress"
        >
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              role="tab"
              aria-selected={index === currentStep}
              aria-label={`Step ${index + 1}: ${steps[index].title}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>

          <Button onClick={handleNext}>
            {isLastStep ? "Get Started" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
