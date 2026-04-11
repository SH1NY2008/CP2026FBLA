import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { ClaimedBusiness } from './types';

export async function claimBusiness(
  placeId: string,
  ownerId: string,
  ownerEmail: string,
): Promise<void> {
  await setDoc(doc(db, 'claimedBusinesses', placeId), {
    placeId,
    ownerId,
    ownerEmail,
    claimedAt: serverTimestamp(),
    verified: true,
    bio: '',
    hoursOverride: [],
    teamMembers: [],
    menuCategories: [],
    contactEmail: ownerEmail,
    contactPhone: '',
  });
}

export async function getClaimedBusiness(placeId: string): Promise<ClaimedBusiness | null> {
  const snap = await getDoc(doc(db, 'claimedBusinesses', placeId));
  return snap.exists() ? (snap.data() as ClaimedBusiness) : null;
}

export async function getBusinessesOwnedBy(ownerId: string): Promise<ClaimedBusiness[]> {
  const q = query(collection(db, 'claimedBusinesses'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ClaimedBusiness);
}

export async function updateBusinessProfile(
  placeId: string,
  data: Partial<ClaimedBusiness>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, 'claimedBusinesses', placeId), data as any);
}
