import { z } from 'zod';

/** Query validation for `/api/places/nearby` — keeps handlers declarative. */
export const nearbySearchQuerySchema = z.object({
  lat: z.string().min(1, 'lat is required'),
  lng: z.string().min(1, 'lng is required'),
  radius: z.string().min(1, 'radius is required'),
  type: z.string().optional(),
});

export const placeDetailsQuerySchema = z.object({
  placeId: z.string().min(1, 'placeId is required'),
});

export const geocodeQuerySchema = z.object({
  address: z.string().min(1, 'address is required'),
});

export const reverseGeocodeQuerySchema = z.object({
  lat: z.string().min(1, 'lat is required'),
  lng: z.string().min(1, 'lng is required'),
});
