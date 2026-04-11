export interface Deal {
  id: string;
  business: string;
  locations?: string;
  title: string;
  address?: string;
  distance?: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  salePrice: number;
  promoPrice?: number;
  promoCode?: string;
  isPopularGift?: boolean;
  category: string;
  imageUrl: string;
}

export const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    business: "Sam's Club",
    title: "Sam's Club Membership Deal — Join Today for Just $25",
    rating: 4.3,
    reviewCount: 129928,
    originalPrice: 50,
    salePrice: 25,
    isPopularGift: true,
    category: 'Shopping',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  },
  {
    id: '2',
    business: 'Native Hut Mini Golf',
    title: 'Island-Themed 18-Hole Mini Golf at Native Hut',
    address: 'Branson Theatre District, Bra…',
    distance: '39.8 mi',
    rating: 4.7,
    reviewCount: 147,
    originalPrice: 8.50,
    salePrice: 5,
    promoPrice: 4.95,
    promoCode: 'FUN',
    isPopularGift: true,
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=80',
  },
  {
    id: '3',
    business: 'AMC Theatres',
    locations: '443 Locations',
    title: 'AMC Yellow Ticket Deals & Snacks – Big-Screen Savings Anytime!',
    address: '3200 East Montclair Street, Spr…',
    distance: '5.6 mi',
    rating: 4.7,
    reviewCount: 8959,
    originalPrice: 19.49,
    salePrice: 12.82,
    promoPrice: 12.18,
    promoCode: 'SHOWTIME',
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  },
  {
    id: '4',
    business: 'Valvoline Instant Oil Change',
    locations: '5 Locations',
    title: 'Valvoline Instant Oil Change (Up to 50% Off)',
    address: 'Oak Grove, Springfield',
    distance: '3.5 mi',
    rating: 4.7,
    reviewCount: 379,
    originalPrice: 79.99,
    salePrice: 39.99,
    isPopularGift: true,
    category: 'Auto',
    imageUrl: 'https://images.unsplash.com/photo-1625047509252-ab38fb5c7343?w=600&q=80',
  },
  {
    id: '5',
    business: 'The Branson Coaster',
    locations: 'Branson, Missouri',
    title: 'Branson Coaster & Gem Mining Adventure with Snapshot – Ride…',
    address: 'Branson Theatre District, Bra…',
    distance: '39.7 mi',
    rating: 4.8,
    reviewCount: 884,
    originalPrice: 35.97,
    salePrice: 26.98,
    promoPrice: 26.71,
    promoCode: 'FUN',
    isPopularGift: true,
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600&q=80',
  },
  {
    id: '6',
    business: 'Olive Garden',
    locations: 'Multiple Locations',
    title: 'Olive Garden: $25 to Spend on Food & Drinks for Two',
    address: 'Various Locations',
    distance: '2.1 mi',
    rating: 4.4,
    reviewCount: 54210,
    originalPrice: 40,
    salePrice: 25,
    isPopularGift: true,
    category: 'Food & Drink',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },
  {
    id: '7',
    business: 'Massage Envy',
    locations: '3 Locations',
    title: '60-Minute Customized Massage at Massage Envy',
    address: 'East Battlefield Rd, Springfield',
    distance: '4.2 mi',
    rating: 4.5,
    reviewCount: 22841,
    originalPrice: 90,
    salePrice: 49.99,
    isPopularGift: true,
    category: 'Health & Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
  },
  {
    id: '8',
    business: 'Top Golf',
    title: 'Top Golf: $25 Game Card + Bay Rental Credit',
    address: 'South Campbell Ave, Springfield',
    distance: '6.8 mi',
    rating: 4.6,
    reviewCount: 3120,
    originalPrice: 50,
    salePrice: 35,
    promoPrice: 33.25,
    promoCode: 'SWING',
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&q=80',
  },
];

export const DEALS_BY_ID = Object.fromEntries(MOCK_DEALS.map((d) => [d.id, d]));
