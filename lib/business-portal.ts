import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ClaimedBusiness {
  placeId: string;
  ownerId: string;
  ownerEmail: string;
  claimedAt: Timestamp;
  verified: boolean;
  bio: string;
  hoursOverride: DayHours[];
  teamMembers: TeamMember[];
  menuCategories: MenuCategory[];
  contactEmail: string;
  contactPhone: string;
}

export interface DayHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface BusinessDeal {
  id?: string;
  placeId: string;
  ownerId: string;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  promoCode?: string;
  category: string;
  imageUrl: string;
  expiresAt: Timestamp | null;
  featured: boolean;
  active: boolean;
  createdAt: Timestamp;
}

export interface BusinessAnnouncement {
  id?: string;
  placeId: string;
  ownerId: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Timestamp;
}

export interface BusinessEvent {
  id?: string;
  placeId: string;
  ownerId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  rsvpCount: number;
  rsvpUserIds: string[];
  createdAt: Timestamp;
}

export interface OwnerReply {
  id?: string;
  placeId: string;
  commentId: string;
  ownerId: string;
  ownerName: string;
  text: string;
  createdAt: Timestamp;
}

export interface BusinessInquiry {
  id?: string;
  placeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface PlaceAnalytics {
  totalCheckins: number;
  totalBookmarks: number;
  totalReviews: number;
  totalComments: number;
  totalPhotos: number;
  checkinsByDay: Record<string, number>;
}

// ── Day constants ─────────────────────────────────────────────────────────────

export const WEEK_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export const DEFAULT_HOURS: DayHours[] = WEEK_DAYS.map((day) => ({
  day,
  open: '09:00',
  close: '17:00',
  closed: day === 'Sunday',
}));

export const DEAL_CATEGORIES = [
  'Food & Drink', 'Entertainment', 'Shopping', 'Health & Beauty',
  'Auto', 'Services', 'Travel', 'Other',
];

// ── Claim helpers ─────────────────────────────────────────────────────────────

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

// ── Deals helpers ─────────────────────────────────────────────────────────────

export async function createDeal(deal: Omit<BusinessDeal, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'businessDeals'), {
    ...deal,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDealsForBusiness(placeId: string): Promise<BusinessDeal[]> {
  const q = query(
    collection(db, 'businessDeals'),
    where('placeId', '==', placeId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDeal));
}

export async function updateDeal(dealId: string, data: Partial<BusinessDeal>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, 'businessDeals', dealId), data as any);
}

export async function deleteDeal(dealId: string): Promise<void> {
  await deleteDoc(doc(db, 'businessDeals', dealId));
}

export async function getAllActiveDeals(): Promise<BusinessDeal[]> {
  const q = query(
    collection(db, 'businessDeals'),
    where('active', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDeal));
}

// ── Announcements helpers ─────────────────────────────────────────────────────

export async function createAnnouncement(
  ann: Omit<BusinessAnnouncement, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'businessAnnouncements'), {
    ...ann,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAnnouncementsForBusiness(placeId: string): Promise<BusinessAnnouncement[]> {
  const q = query(
    collection(db, 'businessAnnouncements'),
    where('placeId', '==', placeId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessAnnouncement));
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, 'businessAnnouncements', id));
}

// ── Events helpers ────────────────────────────────────────────────────────────

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
  const q = query(
    collection(db, 'businessEvents'),
    where('placeId', '==', placeId),
    orderBy('date', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessEvent));
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

// ── Owner replies ─────────────────────────────────────────────────────────────

export async function createOwnerReply(
  reply: Omit<OwnerReply, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'ownerReplies'), {
    ...reply,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOwnerRepliesForPlace(placeId: string): Promise<OwnerReply[]> {
  const q = query(collection(db, 'ownerReplies'), where('placeId', '==', placeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OwnerReply));
}

// ── Inquiries ─────────────────────────────────────────────────────────────────

export async function sendInquiry(
  inq: Omit<BusinessInquiry, 'id' | 'createdAt' | 'read'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'businessInquiries'), {
    ...inq,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getInquiriesForBusiness(placeId: string): Promise<BusinessInquiry[]> {
  const q = query(
    collection(db, 'businessInquiries'),
    where('placeId', '==', placeId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessInquiry));
}

export async function markInquiryRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'businessInquiries', id), { read: true });
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

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
