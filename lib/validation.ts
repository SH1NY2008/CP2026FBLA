export const validateReview = (comment: string): string | null => {
  if (comment.length < 10) {
    return 'Review must be at least 10 characters long.';
  }
  if (comment.length > 500) {
    return 'Review must be no more than 500 characters long.';
  }
  if (/(http|www)/.test(comment)) {
    return 'Review cannot contain URLs.';
  }
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (rating <= 0) {
    return 'Please select a rating.';
  }
  return null;
};

export const validateDisplayName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Display name is required.';
  }
  if (name.length > 50) {
    return 'Display name must be no more than 50 characters long.';
  }
  return null;
};