import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { compareCreatedAtDesc } from './firestore-ordering';
import type { BusinessAnnouncement } from '@/domain/business-portal/types';

export async function createAnnouncement(
  ann: Omit<BusinessAnnouncement, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.businessAnnouncements), {
    ...ann,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAnnouncementsForBusiness(
  placeId: string,
): Promise<BusinessAnnouncement[]> {
  const q = query(
    collection(db, COLLECTIONS.businessAnnouncements),
    where('placeId', '==', placeId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as BusinessAnnouncement))
    .sort(compareCreatedAtDesc);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.businessAnnouncements, id));
}
