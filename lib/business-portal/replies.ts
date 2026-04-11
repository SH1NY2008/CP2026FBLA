import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { COLLECTIONS } from '@/lib/firestore/schema';
import type { OwnerReply } from './types';

export async function createOwnerReply(
  reply: Omit<OwnerReply, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ownerReplies), {
    ...reply,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOwnerRepliesForPlace(placeId: string): Promise<OwnerReply[]> {
  const q = query(collection(db, COLLECTIONS.ownerReplies), where('placeId', '==', placeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OwnerReply));
}
