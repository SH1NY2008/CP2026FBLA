import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { compareCreatedAtDesc } from './firestore-ordering';
import type { BusinessDeal } from './types';

export async function createDeal(
  deal: Omit<BusinessDeal, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'businessDeals'), {
    ...deal,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDealsForBusiness(placeId: string): Promise<BusinessDeal[]> {
  const q = query(collection(db, 'businessDeals'), where('placeId', '==', placeId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as BusinessDeal))
    .sort(compareCreatedAtDesc);
}

export async function updateDeal(dealId: string, data: Partial<BusinessDeal>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, 'businessDeals', dealId), data as any);
}

export async function deleteDeal(dealId: string): Promise<void> {
  await deleteDoc(doc(db, 'businessDeals', dealId));
}

export async function getAllActiveDeals(): Promise<BusinessDeal[]> {
  const q = query(collection(db, 'businessDeals'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDeal));
}
