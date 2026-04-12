import type { Timestamp } from 'firebase/firestore';

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
