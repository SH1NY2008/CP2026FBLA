'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StarRating } from '@/components/star-rating';
import { addReview } from '@/lib/data';
import { validateRating } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  businessId: string;
  onSuccess?: (newRating: number) => void;
  className?: string;
}

export function ReviewForm({
  businessId,
  onSuccess,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const ratingError = validateRating(rating);
    if (ratingError) {
      setError(ratingError);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const result = addReview({
        businessId,
        rating,
      });

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message });
        setRating(0);
        onSuccess?.(rating);
      } else {
        setSubmitStatus({ type: 'error', message: result.message });
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
    const ratingError = validateRating(value);
    if (ratingError) {
      setError(ratingError);
    } else {
      setError(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      {submitStatus.type && (
        <Alert
          variant={submitStatus.type === 'error' ? 'destructive' : 'default'}
          className={cn(
            submitStatus.type === 'success' &&
              'border-emerald-500 text-emerald-700 bg-emerald-50'
          )}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={handleRatingChange}
          />
          <span className="text-sm text-muted-foreground">
            {rating > 0 ? `${rating} stars` : 'Click to rate'}
          </span>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
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
            Submit Rating
          </>
        )}
      </Button>
    </form>
  );
}
