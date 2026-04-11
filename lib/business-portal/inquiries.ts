import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { compareCreatedAtDesc } from './firestore-ordering';
import type { BusinessInquiry } from './types';

export async function sendInquiry(
  inq: Omit<BusinessInquiry, 'id' | 'createdAt' | 'read'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.businessInquiries), {
    ...inq,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getInquiriesForBusiness(placeId: string): Promise<BusinessInquiry[]> {
  const q = query(
    collection(db, COLLECTIONS.businessInquiries),
    where('placeId', '==', placeId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as BusinessInquiry))
    .sort(compareCreatedAtDesc);
}

export async function markInquiryRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.businessInquiries, id), { read: true });
}
