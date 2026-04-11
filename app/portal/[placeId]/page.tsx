'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  Tag,
  Megaphone,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Mail,
  Store,
  ImagePlus,
  Loader2,
  Star,
  Eye,
  Bookmark,
  Camera,
  DollarSign,
  X,
  ChevronRight,
  ShieldCheck,
  Utensils,
  Send,
  UserPlus,
} from 'lucide-react';
import {
  getClaimedBusiness,
  updateBusinessProfile,
  createDeal,
  getDealsForBusiness,
  deleteDeal,
  updateDeal,
  createAnnouncement,
  getAnnouncementsForBusiness,
  deleteAnnouncement,
  createEvent,
  getEventsForBusiness,
  deleteEvent,
  getPlaceAnalytics,
  getInquiriesForBusiness,
  markInquiryRead,
  getOwnerRepliesForPlace,
  createOwnerReply,
  DEFAULT_HOURS,
  DEAL_CATEGORIES,
  WEEK_DAYS,
  type ClaimedBusiness,
  type BusinessDeal,
  type BusinessAnnouncement,
  type BusinessEvent,
  type PlaceAnalytics,
  type BusinessInquiry,
  type DayHours,
  type TeamMember,
  type MenuCategory,
  type MenuItem,
  type OwnerReply,
} from '@/lib/business-portal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { SolarPanel } from '@/components/solar-panel';
import { AreaInsights } from '@/components/area-insights';

type Tab = 'profile' | 'deals' | 'announcements' | 'events' | 'analytics' | 'reviews' | 'menu' | 'inquiries';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'deals', label: 'Deals', icon: Tag },
  { id: 'announcements', label: 'Posts', icon: Megaphone },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'menu', label: 'Menu', icon: Utensils },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'inquiries', label: 'Inquiries', icon: Mail },
];

const STAT_COLORS = [
  'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
  'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
  'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
  'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
];

export default function PortalDashboard() {
  const params = useParams() ?? {};
  const router = useRouter();
  const placeId = (params as Record<string, string>).placeId ?? '';
  const { user } = useAuth();

  const [claim, setClaim] = useState<ClaimedBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (!placeId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getClaimedBusiness(placeId);
        if (!data || (user && data.ownerId !== user.uid)) {
          router.push('/portal');
          return;
        }
        setClaim(data);
        const res = await fetch(`/api/places/details?placeId=${placeId}`);
        const d = await res.json();
        if (d.result?.name) setBusinessName(d.result.name);
      } catch {
        router.push('/portal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [placeId, user, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-6xl pt-28 pb-16">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </Container>
      </main>
    );
  }

  if (!claim) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-6xl pt-28 pb-16">
        {/* Back + title */}
        <div className="pt-6 mb-8">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Businesses
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground truncate">
                {businessName || 'Business Dashboard'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {claim.verified && (
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Owner
                  </span>
                )}
                <Link href={`/business/${placeId}`} className="hover:text-foreground transition-colors flex items-center gap-1">
                  View public page <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-8 border-b border-border/50 scrollbar-none">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-foreground text-foreground bg-muted/50'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'profile' && <ProfileTab claim={claim} onUpdate={setClaim} businessName={businessName} />}
        {activeTab === 'analytics' && <AnalyticsTab placeId={placeId} />}
        {activeTab === 'deals' && <DealsTab placeId={placeId} ownerId={user!.uid} />}
        {activeTab === 'announcements' && <AnnouncementsTab placeId={placeId} ownerId={user!.uid} />}
        {activeTab === 'events' && <EventsTab placeId={placeId} ownerId={user!.uid} />}
        {activeTab === 'menu' && <MenuTab claim={claim} onUpdate={setClaim} />}
        {activeTab === 'reviews' && <ReviewsTab placeId={placeId} ownerId={user!.uid} ownerName={businessName} />}
        {activeTab === 'inquiries' && <InquiriesTab placeId={placeId} />}
      </Container>
    </main>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab({
  claim,
  onUpdate,
  businessName,
}: {
  claim: ClaimedBusiness;
  onUpdate: (c: ClaimedBusiness) => void;
  businessName: string;
}) {
  const [bio, setBio] = useState(claim.bio ?? '');
  const [contactEmail, setContactEmail] = useState(claim.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(claim.contactPhone ?? '');
  const [hours, setHours] = useState<DayHours[]>(
    claim.hoursOverride?.length ? claim.hoursOverride : DEFAULT_HOURS,
  );
  const [team, setTeam] = useState<TeamMember[]>(claim.teamMembers ?? []);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessProfile(claim.placeId, {
        bio,
        contactEmail,
        contactPhone,
        hoursOverride: hours,
        teamMembers: team,
      });
      onUpdate({ ...claim, bio, contactEmail, contactPhone, hoursOverride: hours, teamMembers: team });
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (idx: number, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));
  };

  const addTeamMember = () => {
    setTeam((prev) => [...prev, { id: Date.now().toString(), name: '', role: '', photoUrl: '' }]);
  };

  const updateTeamMember = (idx: number, field: keyof TeamMember, value: string) => {
    setTeam((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const removeTeamMember = (idx: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTeamPhotoUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ref = storageRef(storage, `teamPhotos/${claim.placeId}/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(ref, file);
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed', null, reject, async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          updateTeamMember(idx, 'photoUrl', url);
          resolve();
        });
      });
      toast.success('Photo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bio */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-1">About Your Business</h3>
        <p className="text-sm text-muted-foreground mb-4">Tell customers your story. This appears on your public listing.</p>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder={`Tell customers what makes ${businessName} special…`}
          className="resize-none"
        />
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <Input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@business.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Phone
            </label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </section>

      {/* Hours Override */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-1">Business Hours</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Override Google's hours with your own schedule. These appear with an "Updated by owner" badge.
        </p>
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={h.day} className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground w-24 shrink-0">{h.day}</span>
              <label className="flex items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  checked={h.closed}
                  onChange={(e) => updateHour(i, 'closed', e.target.checked)}
                  className="custom-checkbox h-4 w-4 rounded border-border"
                />
                <span className="text-xs text-muted-foreground">Closed</span>
              </label>
              {!h.closed && (
                <>
                  <Input
                    type="time"
                    value={h.open}
                    onChange={(e) => updateHour(i, 'open', e.target.value)}
                    className="w-32 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={h.close}
                    onChange={(e) => updateHour(i, 'close', e.target.value)}
                    className="w-32 text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team Members */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Team Members</h3>
            <p className="text-sm text-muted-foreground">Highlight the people behind your business.</p>
          </div>
          <Button variant="outline" size="sm" onClick={addTeamMember} className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Add Member
          </Button>
        </div>
        {team.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border rounded-xl">
            <Users className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No team members yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {team.map((m, i) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div className="relative h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground/50" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleTeamPhotoUpload(i, e)}
                    disabled={uploadingPhoto}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={m.name}
                    onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                    placeholder="Name"
                    className="text-sm"
                  />
                  <Input
                    value={m.role}
                    onChange={(e) => updateTeamMember(i, 'role', e.target.value)}
                    placeholder="Role (e.g. Head Chef)"
                    className="text-sm"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeTeamMember(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ placeId }: { placeId: string }) {
  const [analytics, setAnalytics] = useState<PlaceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getPlaceAnalytics(placeId)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`/api/places/details?placeId=${placeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.result?.geometry?.location) setCoords(d.result.geometry.location);
      })
      .catch(() => {});
  }, [placeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) return <p className="text-muted-foreground">Failed to load analytics.</p>;

  const stats = [
    { icon: CheckCircle2, label: 'Check-ins', value: analytics.totalCheckins, color: STAT_COLORS[0] },
    { icon: Bookmark, label: 'Bookmarks', value: analytics.totalBookmarks, color: STAT_COLORS[1] },
    { icon: Star, label: 'Reviews', value: analytics.totalReviews, color: STAT_COLORS[2] },
    { icon: MessageSquare, label: 'Comments', value: analytics.totalComments, color: STAT_COLORS[3] },
    { icon: Camera, label: 'Photos', value: analytics.totalPhotos, color: STAT_COLORS[4] },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-xl border bg-gradient-to-br p-5 ${color}`}>
            <Icon className="h-5 w-5 mb-3" />
            <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-sm font-medium text-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Engagement Summary</h3>
        <p className="text-sm text-muted-foreground">
          Your business has received <span className="font-semibold text-foreground">{analytics.totalCheckins}</span> check-ins,{' '}
          <span className="font-semibold text-foreground">{analytics.totalBookmarks}</span> bookmarks, and{' '}
          <span className="font-semibold text-foreground">{analytics.totalComments}</span> community comments.
          {analytics.totalPhotos > 0 && (
            <> Customers have shared <span className="font-semibold text-foreground">{analytics.totalPhotos}</span> photos.</>
          )}
        </p>
      </section>

      {coords && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Neighborhood Breakdown</h3>
            <AreaInsights lat={coords.lat} lng={coords.lng} radius={500} />
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Solar Potential</h3>
            <p className="text-xs text-muted-foreground mb-3">
              See if your building could benefit from solar energy.
            </p>
            <SolarPanel lat={coords.lat} lng={coords.lng} />
          </section>
        </div>
      )}
    </div>
  );
}

// ── Deals Tab ─────────────────────────────────────────────────────────────────

function DealsTab({ placeId, ownerId }: { placeId: string; ownerId: string }) {
  const [deals, setDeals] = useState<BusinessDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [category, setCategory] = useState(DEAL_CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await getDealsForBusiness(placeId);
      setDeals(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { loadDeals(); }, [placeId]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setOriginalPrice(''); setSalePrice('');
    setPromoCode(''); setCategory(DEAL_CATEGORIES[0]); setImageUrl('');
    setExpiresAt(''); setFeatured(false); setShowForm(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !originalPrice || !salePrice) {
      toast.error('Fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      await createDeal({
        placeId,
        ownerId,
        title: title.trim(),
        description: description.trim(),
        originalPrice: parseFloat(originalPrice),
        salePrice: parseFloat(salePrice),
        promoCode: promoCode.trim() || undefined,
        category,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
        expiresAt: expiresAt ? new Date(expiresAt) as unknown as import('firebase/firestore').Timestamp : null,
        featured,
        active: true,
      });
      toast.success('Deal created!');
      resetForm();
      loadDeals();
    } catch {
      toast.error('Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (deal: BusinessDeal) => {
    if (!deal.id) return;
    await updateDeal(deal.id, { active: !deal.active });
    loadDeals();
  };

  const handleDelete = async (id: string) => {
    await deleteDeal(id);
    toast.success('Deal deleted');
    loadDeals();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Your Deals & Promotions</h3>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5" size="sm">
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 50% Off Sunday Brunch" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the deal…" rows={2} className="resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Original Price *</label>
              <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="49.99" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sale Price *</label>
              <Input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="24.99" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Promo Code</label>
              <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="SAVE50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 text-sm px-3 rounded-lg border border-border bg-background text-foreground">
                {DEAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Expires</label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Image URL</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="custom-checkbox h-4 w-4" />
              <span className="text-sm text-foreground">Featured deal (promoted placement)</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create Deal
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : deals.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <Tag className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No deals yet. Create your first promotion!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{deal.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs line-through text-muted-foreground">${deal.originalPrice}</span>
                  <span className="text-xs font-bold text-foreground">${deal.salePrice}</span>
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    -{Math.round((1 - deal.salePrice / deal.originalPrice) * 100)}%
                  </span>
                  {deal.promoCode && (
                    <span className="text-xs text-purple-400 font-semibold">{deal.promoCode}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(deal)}
                  className={deal.active ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'}
                >
                  {deal.active ? 'Active' : 'Paused'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deal.id && handleDelete(deal.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

function AnnouncementsTab({ placeId, ownerId }: { placeId: string; ownerId: string }) {
  const [posts, setPosts] = useState<BusinessAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setPosts(await getAnnouncementsForBusiness(placeId)); }
    catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [placeId]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) { toast.error('Fill in all fields'); return; }
    setSubmitting(true);
    try {
      await createAnnouncement({ placeId, ownerId, title: title.trim(), content: content.trim(), pinned });
      toast.success('Post published!');
      setTitle(''); setContent(''); setPinned(false); setShowForm(false);
      load();
    } catch { toast.error('Failed to publish'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    toast.success('Post deleted');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Announcements & Updates</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Menu Just Dropped!" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Content</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Share updates with your customers…" className="resize-none" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="custom-checkbox h-4 w-4" />
            <span className="text-sm text-foreground">Pin this post</span>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Publish
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <Megaphone className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No posts yet. Share updates with your community!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{post.title}</h4>
                  {post.pinned && <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Pinned</span>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => post.id && handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              {post.createdAt && (
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date((post.createdAt as any).seconds * 1000).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Events Tab ────────────────────────────────────────────────────────────────

function EventsTab({ placeId, ownerId }: { placeId: string; ownerId: string }) {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setEvents(await getEventsForBusiness(placeId)); }
    catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [placeId]);

  const handleCreate = async () => {
    if (!title.trim() || !date) { toast.error('Fill in required fields'); return; }
    setSubmitting(true);
    try {
      await createEvent({ placeId, ownerId, title: title.trim(), description: description.trim(), date, startTime, endTime });
      toast.success('Event created!');
      setTitle(''); setDescription(''); setDate(''); setShowForm(false);
      load();
    } catch { toast.error('Failed to create event'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    toast.success('Event deleted');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Events Calendar</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Event Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Live Jazz Night" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Event details…" className="resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date *</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start Time</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End Time</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting} className="gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarDays className="h-3.5 w-3.5" />}
              Create Event
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <CalendarDays className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming events. Create one to engage your community!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const eventDate = new Date(evt.date + 'T00:00:00');
            const isPast = eventDate < new Date();
            return (
              <div key={evt.id} className={`p-5 rounded-xl border bg-card ${isPast ? 'border-border/50 opacity-60' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-4 items-start">
                    <div className="text-center shrink-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase">
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-black text-foreground leading-none">
                        {eventDate.getDate()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{evt.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {evt.startTime} – {evt.endTime}
                      </p>
                      {evt.description && (
                        <p className="text-sm text-muted-foreground mt-2">{evt.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        <Users className="h-3 w-3 inline mr-1" />
                        {evt.rsvpCount} {evt.rsvpCount === 1 ? 'RSVP' : 'RSVPs'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => evt.id && handleDelete(evt.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Menu Tab ──────────────────────────────────────────────────────────────────

function MenuTab({ claim, onUpdate }: { claim: ClaimedBusiness; onUpdate: (c: ClaimedBusiness) => void }) {
  const [categories, setCategories] = useState<MenuCategory[]>(claim.menuCategories ?? []);
  const [saving, setSaving] = useState(false);

  const addCategory = () => {
    setCategories((prev) => [...prev, { id: Date.now().toString(), name: '', items: [] }]);
  };

  const updateCategoryName = (idx: number, name: string) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)));
  };

  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItem = (catIdx: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? { ...c, items: [...c.items, { id: Date.now().toString(), name: '', description: '', price: 0 }] }
          : c
      ),
    );
  };

  const updateItem = (catIdx: number, itemIdx: number, field: keyof MenuItem, value: string | number) => {
    setCategories((prev) =>
      prev.map((c, ci) =>
        ci === catIdx
          ? { ...c, items: c.items.map((it, ii) => (ii === itemIdx ? { ...it, [field]: value } : it)) }
          : c
      ),
    );
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    setCategories((prev) =>
      prev.map((c, ci) =>
        ci === catIdx ? { ...c, items: c.items.filter((_, ii) => ii !== itemIdx) } : c
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessProfile(claim.placeId, { menuCategories: categories });
      onUpdate({ ...claim, menuCategories: categories });
      toast.success('Menu saved!');
    } catch {
      toast.error('Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Menu / Services</h3>
          <p className="text-sm text-muted-foreground">List your menu items or services with prices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addCategory} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Menu
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <Utensils className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No menu categories yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat, ci) => (
            <div key={cat.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Input
                  value={cat.name}
                  onChange={(e) => updateCategoryName(ci, e.target.value)}
                  placeholder="Category name (e.g. Appetizers)"
                  className="flex-1 font-semibold"
                />
                <Button variant="ghost" size="sm" onClick={() => removeCategory(ci)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                {cat.items.map((item, ii) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1 text-sm"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(ci, ii, 'description', e.target.value)}
                      placeholder="Description"
                      className="flex-1 text-sm"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price || ''}
                        onChange={(e) => updateItem(ci, ii, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-20 text-sm"
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(ci, ii)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => addItem(ci)} className="gap-1.5 w-full">
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Tab (Owner Replies) ───────────────────────────────────────────────

function ReviewsTab({
  placeId,
  ownerId,
  ownerName,
}: {
  placeId: string;
  ownerId: string;
  ownerName: string;
}) {
  const [comments, setComments] = useState<{ id: string; author: string; text: string; timestamp: Date }[]>([]);
  const [replies, setReplies] = useState<Record<string, OwnerReply>>({});
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'comments'), where('placeId', '==', placeId));
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            author: d.data().author ?? 'Anonymous',
            text: d.data().text ?? '',
            timestamp: d.data().timestamp?.toDate() ?? new Date(),
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setComments(list);

        const existingReplies = await getOwnerRepliesForPlace(placeId);
        const map: Record<string, OwnerReply> = {};
        existingReplies.forEach((r) => { map[r.commentId] = r; });
        setReplies(map);
      } catch { /* empty */ }
      setLoading(false);
    };
    load();
  }, [placeId]);

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await createOwnerReply({
        placeId,
        commentId,
        ownerId,
        ownerName,
        text: replyText.trim(),
      });
      const updated = await getOwnerRepliesForPlace(placeId);
      const map: Record<string, OwnerReply> = {};
      updated.forEach((r) => { map[r.commentId] = r; });
      setReplies(map);
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted!');
    } catch { toast.error('Failed to post reply'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-foreground">Customer Reviews & Replies</h3>
      <p className="text-sm text-muted-foreground">Respond to reviews to build trust and show customers you care.</p>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <MessageSquare className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{c.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {!replies[c.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
                    className="gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{c.text}</p>

              {replies[c.id] && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-emerald-500/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500">Owner Response</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{replies[c.id].text}</p>
                </div>
              )}

              {replyingTo === c.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="Write your response…"
                    className="resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleReply(c.id)} disabled={submitting} className="gap-1.5">
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Reply as Owner
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inquiries Tab ─────────────────────────────────────────────────────────────

function InquiriesTab({ placeId }: { placeId: string }) {
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInquiriesForBusiness(placeId)
      .then(setInquiries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [placeId]);

  const handleMarkRead = async (id: string) => {
    await markInquiryRead(id);
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, read: true } : inq)));
  };

  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Customer Inquiries</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{unreadCount}</span> unread
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : inquiries.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl">
          <Mail className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No inquiries yet. They'll appear here when customers reach out.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`p-5 rounded-xl border bg-card ${!inq.read ? 'border-blue-500/30 bg-blue-500/5' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{inq.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    From {inq.userName} ({inq.userEmail})
                  </p>
                </div>
                {!inq.read && (
                  <Button variant="outline" size="sm" onClick={() => inq.id && handleMarkRead(inq.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inq.message}</p>
              {inq.createdAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date((inq.createdAt as any).seconds * 1000).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
