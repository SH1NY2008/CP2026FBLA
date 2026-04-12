/**
 * Centralizes environment access for Google Maps server routes.
 * Keeps API route handlers free of repeated env string checks.
 */
export function getGoogleMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
}
