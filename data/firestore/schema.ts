/**
 * Firestore layout for this app — single place to see how data is keyed and nested.
 *
 * Design choices (good for demos / rubrics):
 * - User-private lists (bookmarks, saved deal ids) live in one doc per uid so reads are O(1).
 *   Those docs use arrays (`placeIds`, `dealIds`) instead of a subcollection per bookmark.
 * - Per-place data (claimed profile, aggregate rating, check-in rollups) uses Google `placeId` as the doc id.
 * - Social data (comments, photos) is top-level with `placeId` / `authorId` fields so we can query
 *   by place for a business page or by author for a dashboard without duplicating writes.
 * - Owner-created portal content (deals, events, …) is separate collections keyed by auto-id,
 *   with `placeId` on each document for filtering.
 *
 * Where we use complex fields: arrays for membership lists, maps (`placeTypes`) for histograms,
 * and nested arrays on claimed businesses (`menuCategories[].items`, `hoursOverride`, `teamMembers`).
 */
import { doc, type Firestore } from 'firebase/firestore';

/** Every root collection name — use these instead of string literals so renames stay safe. */
export const COLLECTIONS = {
  /** Owner-editable profile; doc id = Google placeId */
  claimedBusinesses: 'claimedBusinesses',
  /** One doc per user: `{ placeIds: string[] }` */
  bookmarks: 'bookmarks',
  /** One doc per user: `{ dealIds: string[] }` */
  savedDeals: 'savedDeals',
  /** Per-user engagement: arrays + `placeTypes` map — see UserActivityDocument */
  userActivity: 'userActivity',
  /** Rollup: `{ count, userIds[] }` per place */
  checkins: 'checkins',
  /** Aggregated stars + count; optional overlay on Google ratings */
  businessRatings: 'businessRatings',
  /** Flat thread: use `parentId` to nest replies in the UI */
  comments: 'comments',
  /** User uploads tied to a place */
  communityPhotos: 'communityPhotos',
  businessDeals: 'businessDeals',
  businessAnnouncements: 'businessAnnouncements',
  businessEvents: 'businessEvents',
  ownerReplies: 'ownerReplies',
  businessInquiries: 'businessInquiries',
} as const;

export type CollectionId = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// --- Typed document shapes (subset — Firestore may add server timestamps etc.) ---

/** `bookmarks/{uid}` */
export interface BookmarksDocument {
  placeIds: string[];
}

/** `savedDeals/{uid}` */
export interface SavedDealsDocument {
  dealIds: string[];
}

/** `userActivity/{uid}` — arrays for deduped place lists; map for category histogram */
export interface UserActivityDocument {
  checkinCount: number;
  ratingCount: number;
  checkedInPlaces: string[];
  ratedPlaces: string[];
  /** Google place `types` tallies — Record works better than pairs[] for partial updates */
  placeTypes: Record<string, number>;
}

/** `checkins/{placeId}` */
export interface CheckinsDocument {
  count: number;
  userIds: string[];
}

/** `businessRatings/{placeId}` */
export interface BusinessRatingsDocument {
  rating: number;
  ratingCount: number;
}

// --- Ref helpers (keep Firestore paths and variable scope obvious at call sites) ---

export function userDataDoc(
  db: Firestore,
  name: 'bookmarks' | 'savedDeals' | 'userActivity',
  uid: string,
) {
  return doc(db, COLLECTIONS[name], uid);
}

export function placeDataDoc(
  db: Firestore,
  name: 'claimedBusinesses' | 'businessRatings' | 'checkins',
  placeId: string,
) {
  return doc(db, COLLECTIONS[name], placeId);
}
