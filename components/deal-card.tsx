"use client"

/**
 * Deal Card Component
 * 
 * Displays promotional deals with countdown timers, discount info,
 * and redemption codes.
 * 
 * @module DealCard
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Store,
  Percent,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { type Deal, type Business, getBusinessById, redeemDeal } from "@/lib/data"
import { cn } from "@/lib/utils"

interface DealCardProps {
  deal: Deal
  business?: Business
  showBusiness?: boolean
  className?: string
}

/**
 * Deal Card Component
 * Displays deal information with countdown and code reveal
 * 
 * @param deal - Deal data to display
 * @param business - Business data (optional, will be fetched if not provided)
 * @param showBusiness - Whether to show business name
 * @param className - Additional CSS classes
 */
export function DealCard({ deal, business: providedBusiness, showBusiness = true, className }: DealCardProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isExpired, setIsExpired] = useState(false)
  const [codeRevealed, setCodeRevealed] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  const business = providedBusiness || (showBusiness ? getBusinessById(deal.businessId) : null)
  const redemptionPercent = (deal.redemptions / deal.maxRedemptions) * 100

  /**
   * Updates countdown timer every second
   */
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(deal.expiresAt).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft("Expired")
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [deal.expiresAt])

  /**
   * Handles code reveal and redemption tracking
   */
  const handleRevealCode = () => {
    if (!codeRevealed) {
      redeemDeal(deal.id)
      setCodeRevealed(true)
    }
  }

  /**
   * Copies promo code to clipboard
   */
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(deal.code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = deal.code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-border/80",
        isExpired && "opacity-60",
        className
      )}
    >
      <CardHeader className="pb-3 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Business Name */}
            {business && showBusiness && (
              <Link
                href={`/business?id=${business.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <Store className="h-4 w-4" />
                {business.name}
              </Link>
            )}

            {/* Deal Title */}
            <h3 className="font-semibold text-lg text-balance">{deal.title}</h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-1">
              {deal.description}
            </p>
          </div>

          {/* Discount Badge */}
          <Badge
            className={cn(
              "flex-shrink-0 text-lg px-3 py-1",
              deal.discountPercent >= 25
                ? "bg-orange-500 hover:bg-orange-500"
                : "bg-emerald-600 hover:bg-emerald-600",
              "text-white"
            )}
          >
            {deal.discountPercent > 0 ? (
              <>
                <Percent className="h-4 w-4 mr-1" />
                {deal.discountPercent}% OFF
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-1" />
                DEAL
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Comparison */}
        {deal.originalPrice && deal.dealPrice && (
          <div className="flex items-center gap-3">
            <span className="text-lg line-through text-muted-foreground">
              ${deal.originalPrice.toFixed(2)}
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              ${deal.dealPrice.toFixed(2)}
            </span>
          </div>
        )}

        {/* Countdown Timer */}
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            isExpired ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>
            {isExpired ? "This deal has expired" : `Expires in: ${timeLeft}`}
          </span>
        </div>

        {/* Redemption Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Redemptions</span>
            <span>
              {deal.redemptions} / {deal.maxRedemptions} claimed
            </span>
          </div>
          <Progress
            value={redemptionPercent}
            className="h-2"
            aria-label={`${redemptionPercent.toFixed(0)}% of deals claimed`}
          />
        </div>

        {/* Promo Code Section */}
        {!isExpired && (
          <div className="pt-2">
            {codeRevealed ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-2 rounded-md font-mono text-lg text-center">
                  {deal.code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  aria-label={codeCopied ? "Copied!" : "Copy code"}
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRevealCode}
                className="w-full"
                disabled={deal.redemptions >= deal.maxRedemptions}
              >
                <Tag className="mr-2 h-4 w-4" />
                {deal.redemptions >= deal.maxRedemptions
                  ? "Sold Out"
                  : "Get Code"}
              </Button>
            )}
          </div>
        )}

        {/* Terms and Conditions */}
        <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              Terms & Conditions
              {termsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md mt-2">
              {deal.termsAndConditions}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
