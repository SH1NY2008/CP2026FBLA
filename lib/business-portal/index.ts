/**
 * Business portal domain: Firestore-backed owner features for claimed places.
 * Split by concern (claims, deals, events, …) with a single barrel for consumers.
 */
export type {
  ClaimedBusiness,
  DayHours,
  TeamMember,
  MenuCategory,
  MenuItem,
  BusinessDeal,
  BusinessAnnouncement,
  BusinessEvent,
  OwnerReply,
  BusinessInquiry,
  PlaceAnalytics,
} from './types';

export { WEEK_DAYS, DEFAULT_HOURS, DEAL_CATEGORIES } from './constants';

export {
  claimBusiness,
  getClaimedBusiness,
  getBusinessesOwnedBy,
  updateBusinessProfile,
} from './claims';

export {
  createDeal,
  getDealsForBusiness,
  updateDeal,
  deleteDeal,
  getAllActiveDeals,
} from './deals';

export {
  createAnnouncement,
  getAnnouncementsForBusiness,
  deleteAnnouncement,
} from './announcements';

export {
  createEvent,
  getEventsForBusiness,
  deleteEvent,
  rsvpToEvent,
} from './events';

export { createOwnerReply, getOwnerRepliesForPlace } from './replies';

export { sendInquiry, getInquiriesForBusiness, markInquiryRead } from './inquiries';

export { getPlaceAnalytics } from './analytics';
