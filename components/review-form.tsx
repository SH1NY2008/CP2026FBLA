"use client"

import React from "react"

/**
 * Review Form Component
 * 
 * Comprehensive review submission form with star rating selection,
 * text input validation, and spam prevention.
 * 
 * @module ReviewForm
 */

import { useState } from "react"
import { Send, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StarRating } from "@/components/star-rating"
import { addReview } from "@/lib/data"
import {
  validateReview,
  validateRating,
  validateDisplayName,
} from "@/lib/validation"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  businessId: string
  onSuccess?: () => void
  className?: string
}

/**
 * Review Form Component
 * Handles review submission with validation and rate limiting
 * 
 * @param businessId - ID of business being reviewed
 * @param onSuccess - Callback after successful submission
 * @param className - Additional CSS classes
 */
export function ReviewForm({
  businessId,
  onSuccess,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userName, setUserName] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Validates all form fields and returns validation status
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    const nameValidation = validateDisplayName(userName)
    if (!nameValidation.isValid) {
      newErrors.userName = nameValidation.message
    }

    const ratingValidation = validateRating(rating)
    if (!ratingValidation.isValid) {
      newErrors.rating = ratingValidation.message
    }

    const reviewValidation = validateReview(comment)
    if (!reviewValidation.isValid) {
      newErrors.comment = reviewValidation.message
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const result = addReview({
        businessId,
        userId: crypto.randomUUID(),
        userName: userName.trim(),
        rating,
        comment: comment.trim(),
      })

      if (result.success) {
        setSubmitStatus({ type: "success", message: result.message })
        setRating(0)
        setComment("")
        setUserName("")
        onSuccess?.()
      } else {
        setSubmitStatus({ type: "error", message: result.message })
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Real-time validation on field change
   */
  const handleFieldChange = (
    field: string,
    value: string | number,
    validator: (val: string | number) => { isValid: boolean; message: string }
  ) => {
    if (field === "rating") {
      setRating(value as number)
    } else if (field === "comment") {
      setComment(value as string)
    } else if (field === "userName") {
      setUserName(value as string)
    }

    // Clear error if valid
    const validation = validator(value)
    if (validation.isValid) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      noValidate
    >
      {/* Status Messages */}
      {submitStatus.type && (
        <Alert
          variant={submitStatus.type === "error" ? "destructive" : "default"}
          className={cn(
            submitStatus.type === "success" &&
              "border-emerald-500 text-emerald-700 bg-emerald-50"
          )}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="userName">
          Display Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="userName"
          value={userName}
          onChange={(e) =>
            handleFieldChange("userName", e.target.value, (v) =>
              validateDisplayName(v as string)
            )
          }
          placeholder="Enter your name (e.g., John D.)"
          aria-describedby={errors.userName ? "userName-error" : undefined}
          aria-invalid={!!errors.userName}
          className={cn(errors.userName && "border-destructive")}
        />
        {errors.userName && (
          <p id="userName-error" className="text-sm text-destructive">
            {errors.userName}
          </p>
        )}
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>
          Rating <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-4">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={(value) =>
              handleFieldChange("rating", value, (v) =>
                validateRating(v as number)
              )
            }
          />
          <span className="text-sm text-muted-foreground">
            {rating > 0 ? `${rating} stars` : "Click to rate"}
          </span>
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tip: Click on the left half of a star for half-star ratings
        </p>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="comment">
            Your Review <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-xs",
              comment.length > 500
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {comment.length}/500
          </span>
        </div>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) =>
            handleFieldChange("comment", e.target.value, (v) =>
              validateReview(v as string)
            )
          }
          placeholder="Share your experience with this business. What did you like? What could be improved?"
          rows={4}
          aria-describedby={errors.comment ? "comment-error" : "comment-help"}
          aria-invalid={!!errors.comment}
          className={cn(errors.comment && "border-destructive")}
        />
        {errors.comment ? (
          <p id="comment-error" className="text-sm text-destructive">
            {errors.comment}
          </p>
        ) : (
          <p id="comment-help" className="text-xs text-muted-foreground">
            Minimum 10 characters. No URLs or HTML allowed.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Review
          </>
        )}
      </Button>

      {/* Rate Limiting Notice */}
      <p className="text-xs text-muted-foreground">
        To prevent spam, you can submit up to 5 reviews per hour. All reviews
        are subject to our community guidelines.
      </p>
    </form>
  )
}
