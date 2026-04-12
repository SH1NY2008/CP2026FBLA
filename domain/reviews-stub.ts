/** Stub until reviews are persisted to Firestore — UI can call this and get a consistent shape. */
export const addReview = (review: unknown) => {
  console.log('New review submitted:', review);
  return {
    success: true,
    message: 'Your review has been submitted successfully!',
  };
};

export interface Deal {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discountPercent: number;
  originalPrice?: number;
  dealPrice?: number;
  code: string;
  expiresAt: string;
  redemptions: number;
  maxRedemptions: number;
  termsAndConditions: string;
  sourceUrl?: string;
  source?: 'groupon' | 'reddit' | 'manual';
}

export interface Business {
  id: string;
  name: string;
  category: string;
  state: string;
  address?: string;
}

export function getBusinessById(_id: string): Business | undefined {
  return undefined;
}

/** Placeholder for redemption tracking — deals page uses Firestore for saves separately. */
export function redeemDeal(_dealId: string): void {
  // no-op
}
