import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { PlaceAnalytics } from './types';

export async function getPlaceAnalytics(placeId: string): Promise<PlaceAnalytics> {
  const [checkinSnap, bookmarkSnap, ratingsSnap, commentsSnap, photosSnap] = await Promise.all([
    getDoc(doc(db, 'checkins', placeId)),
    getDocs(query(collection(db, 'bookmarks'))),
    getDoc(doc(db, 'businessRatings', placeId)),
    getDocs(query(collection(db, 'comments'), where('placeId', '==', placeId))),
    getDocs(query(collection(db, 'communityPhotos'), where('placeId', '==', placeId))),
  ]);

  let totalBookmarks = 0;
  bookmarkSnap.forEach((d) => {
    const ids: string[] = d.data().placeIds ?? [];
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
