import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { BusinessEvent } from './types';

export async function createEvent(
  evt: Omit<BusinessEvent, 'id' | 'createdAt' | 'rsvpCount' | 'rsvpUserIds'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'businessEvents'), {
    ...evt,
    rsvpCount: 0,
    rsvpUserIds: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getEventsForBusiness(placeId: string): Promise<BusinessEvent[]> {
  const q = query(collection(db, 'businessEvents'), where('placeId', '==', placeId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as BusinessEvent))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'businessEvents', id));
}

export async function rsvpToEvent(eventId: string, userId: string): Promise<void> {
  const ref = doc(db, 'businessEvents', eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const ids: string[] = data.rsvpUserIds ?? [];
  if (ids.includes(userId)) return;
  await updateDoc(ref, {
    rsvpCount: (data.rsvpCount ?? 0) + 1,
    rsvpUserIds: [...ids, userId],
  });
}
