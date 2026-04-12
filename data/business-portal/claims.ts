import {
  collection,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { COLLECTIONS, placeDataDoc } from '@/lib/firestore/schema';
import type { ClaimedBusiness } from '@/domain/business-portal/types';

export async function claimBusiness(
  placeId: string,
  ownerId: string,
  ownerEmail: string,
): Promise<void> {
  await setDoc(placeDataDoc(db, 'claimedBusinesses', placeId), {
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
  const snap = await getDoc(placeDataDoc(db, 'claimedBusinesses', placeId));
  return snap.exists() ? (snap.data() as ClaimedBusiness) : null;
}

export async function getBusinessesOwnedBy(ownerId: string): Promise<ClaimedBusiness[]> {
  const q = query(collection(db, COLLECTIONS.claimedBusinesses), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ClaimedBusiness);
}

export async function updateBusinessProfile(
  placeId: string,
  data: Partial<ClaimedBusiness>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(placeDataDoc(db, 'claimedBusinesses', placeId), data as any);
}
