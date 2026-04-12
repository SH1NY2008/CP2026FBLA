import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { COLLECTIONS, placeDataDoc } from '@/lib/firestore/schema';
import type { PlaceAnalytics } from '@/domain/business-portal/types';

export async function getPlaceAnalytics(placeId: string): Promise<PlaceAnalytics> {
  const [checkinSnap, bookmarkSnap, ratingsSnap, commentsSnap, photosSnap] = await Promise.all([
    getDoc(placeDataDoc(db, 'checkins', placeId)),
    getDocs(query(collection(db, COLLECTIONS.bookmarks))),
    getDoc(placeDataDoc(db, 'businessRatings', placeId)),
    getDocs(query(collection(db, COLLECTIONS.comments), where('placeId', '==', placeId))),
    getDocs(query(collection(db, COLLECTIONS.communityPhotos), where('placeId', '==', placeId))),
  ]);

  let totalBookmarks = 0;
  bookmarkSnap.forEach((d) => {
    const ids: string[] = (d.data().placeIds as string[] | undefined) ?? [];
    if (ids.includes(placeId)) totalBookmarks++;
  });

  const checkinData = checkinSnap.exists() ? checkinSnap.data() : null;
  const ratingsData = ratingsSnap.exists() ? ratingsSnap.data() : null;

  return {
    totalCheckins: checkinData?.count ?? 0,
    totalBookmarks,
    totalReviews: ratingsData?.ratingCount ?? 0,
    totalComments: commentsSnap.size,
    totalPhotos: photosSnap.size,
    checkinsByDay: {},
  };
}
