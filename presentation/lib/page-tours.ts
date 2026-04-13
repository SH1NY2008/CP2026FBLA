/**
 * Per-route guided tours (navbar destinations). Storage: `localStorage['boost-tour-' + routeId]`.
 */

export type TourStep = {
  id: string;
  title: string;
  body: string;
  selectors: string[];
};

const ROUTE_MAP: Record<string, string> = {
  '/': 'home',
  '/browse': 'browse',
  '/explore': 'explore',
  '/deals': 'deals',
  '/trip-planner': 'trip-planner',
  '/portal': 'portal',
  '/accessibility': 'accessibility',
};

export function getRouteIdFromPathname(pathname: string): string | null {
  return ROUTE_MAP[pathname] ?? null;
}

export function tourStorageKey(routeId: string): string {
  return `boost-tour-${routeId}`;
}

/** Migrate one-time from older single home key. */
export function migrateLegacyTourStorage(): void {
  try {
    if (
      localStorage.getItem('boost-app-guided-tour-v1') === '1' &&
      localStorage.getItem(tourStorageKey('home')) !== '1'
    ) {
      localStorage.setItem(tourStorageKey('home'), '1');
    }
  } catch {
    /* ignore */
  }
}

export function isTourCompleted(routeId: string): boolean {
  try {
    return localStorage.getItem(tourStorageKey(routeId)) === '1';
  } catch {
    return true;
  }
}

export function completeTourStorage(routeId: string): void {
  try {
    localStorage.setItem(tourStorageKey(routeId), '1');
  } catch {
    /* ignore */
  }
}

/** Clears completion so the guided tour can run again (e.g. after “Yes, show me around”). */
export function clearTourCompletion(routeId: string): void {
  try {
    localStorage.removeItem(tourStorageKey(routeId));
  } catch {
    /* ignore */
  }
}

export const TOURS_BY_ROUTE: Record<string, TourStep[]> = {
  home: [
    {
      id: 'welcome',
      title: 'Welcome to Boost',
      body:
        'This short tour shows where to find search, AI discovery, deals, trip planning, and business tools. Use Next to move through each area, or Skip anytime.',
      selectors: [],
    },
    {
      id: 'logo',
      title: 'Home & brand',
      body: 'Tap BOOST anytime to return to this landing page from anywhere in the app.',
      selectors: ['[data-tour="tour-logo"]'],
    },
    {
      id: 'nav',
      title: 'Main navigation',
      body:
        'Browse lists businesses on a map. Explore opens the AI Explorer. Deals, Trip Planner, Portal, and Accessibility are always one click away.',
      selectors: ['[data-tour="tour-main-nav"]', '[data-tour="tour-mobile-menu"]'],
    },
    {
      id: 'help',
      title: 'Help & answers',
      body:
        'Open Help for interactive Q&A — smart matching on common questions without leaving your page.',
      selectors: ['[data-tour="tour-help"]'],
    },
    {
      id: 'account',
      title: 'Your account',
      body:
        'Sign in to save bookmarks, deals, and build trip routes from saved places. When signed in, your menu also links to Dashboard and Business Portal.',
      selectors: ['[data-tour="tour-account"]'],
    },
    {
      id: 'hero',
      title: 'Get started',
      body:
        'Start Exploring jumps into Browse with maps and filters. List My Business opens the owner portal to claim a place.',
      selectors: ['[data-tour="tour-hero-ctas"]'],
    },
    {
      id: 'features',
      title: 'Six connected tools',
      body:
        'These cards link to Browse, AI Explorer, Deals, Trip Planner, Portal, and community reviews — the full loop from discovery to visit.',
      selectors: ['[data-tour="tour-feature-grid"]'],
    },
    {
      id: 'footer',
      title: 'More links',
      body:
        'The footer has Help, Resources, Contact, and legal links — useful when you need detail pages or support.',
      selectors: ['[data-tour="tour-footer-nav"]'],
    },
  ],

  browse: [
    {
      id: 'browse-welcome',
      title: 'Browse',
      body:
        'Find businesses near you with category filters, distance, and price. Switch between list and split map view. This tour walks through each control.',
      selectors: [],
    },
    {
      id: 'browse-location',
      title: 'Your area',
      body:
        'Set where you are searching — use auto-detect, pick a country, or type a city. After that, your area appears as a tag you can refine.',
      selectors: ['[data-tour="browse-location-pick"]', '[data-tour="browse-location-set"]'],
    },
    {
      id: 'browse-filters',
      title: 'Refine results',
      body:
        'Choose category, search radius, and price level. On small screens, open Filters from the toolbar; on large screens, filters stay in the left column.',
      selectors: ['[data-tour="browse-filters-desktop"]', '[data-tour="browse-filters-mobile"]'],
    },
    {
      id: 'browse-toolbar',
      title: 'Search & sort',
      body:
        'Filter the list by keyword, sort by distance or rating, and toggle Open now. These apply instantly on top of the loaded results.',
      selectors: ['[data-tour="browse-toolbar"]'],
    },
    {
      id: 'browse-view',
      title: 'List or map',
      body:
        'Use list view for scanning cards, or split view to see the same results on an interactive tile map beside the list.',
      selectors: ['[data-tour="browse-view-toggle"]'],
    },
  ],

  explore: [
    {
      id: 'explore-welcome',
      title: 'AI Explorer',
      body:
        'Ask for places in plain English. Answers use Google Maps grounding; optional GPS bias makes “near me” accurate.',
      selectors: [],
    },
    {
      id: 'explore-location',
      title: 'Location bias',
      body:
        'Turn on “Use my location” so queries like “nearby” rank results around you. You can clear it anytime.',
      selectors: ['[data-tour="explore-locate"]'],
    },
    {
      id: 'explore-search',
      title: 'Ask anything',
      body: 'Type a question, press Enter or Explore. The model returns a short summary plus place cards you can open.',
      selectors: ['[data-tour="explore-search"]'],
    },
    {
      id: 'explore-suggestions',
      title: 'Starter ideas',
      body: 'Tap a suggestion to run it immediately — handy when you are not sure how to phrase a query.',
      selectors: ['[data-tour="explore-suggestions"]'],
    },
  ],

  deals: [
    {
      id: 'deals-welcome',
      title: 'Deals',
      body:
        'Browse curated offers, filter by category, and save hearts to your dashboard when signed in.',
      selectors: [],
    },
    {
      id: 'deals-categories',
      title: 'Categories',
      body: 'Tap a category to narrow the grid, or All to see everything in the catalog.',
      selectors: ['[data-tour="deals-categories"]'],
    },
    {
      id: 'deals-toolbar',
      title: 'Search & sort',
      body:
        'Search titles and businesses, then sort by discount depth, rating, or sale price.',
      selectors: ['[data-tour="deals-toolbar"]'],
    },
    {
      id: 'deals-grid',
      title: 'Save what you like',
      body:
        'Heart a deal to sync it to your dashboard (requires sign-in). Promo lines show codes when available.',
      selectors: ['[data-tour="deals-grid"]'],
    },
  ],

  accessibility: [
    {
      id: 'a11y-welcome',
      title: 'Accessibility',
      body: 'Tune voice navigation and contrast preferences on this page.',
      selectors: [],
    },
    {
      id: 'a11y-voice',
      title: 'Voice navigation',
      body:
        'Enable the mic control, then use the floating button elsewhere on the site to speak destinations like “browse” or “deals”.',
      selectors: ['[data-tour="a11y-voice"]'],
    },
    {
      id: 'a11y-display',
      title: 'Display',
      body: 'High contrast applies site-wide for this browser.',
      selectors: ['[data-tour="a11y-display"]'],
    },
  ],
};

const TRIP_PLANNER_SIGNED_IN: TourStep[] = [
  {
    id: 'trip-welcome',
    title: 'Trip Planner',
    body:
      'Build an efficient route through bookmarked businesses: set a start point, choose how you travel, pick stops, then optimize.',
    selectors: [],
  },
  {
    id: 'trip-start',
    title: 'Starting point',
    body:
      'Set where the route begins — usually your current location — so legs and times are calculated from a real origin.',
    selectors: ['[data-tour="trip-start"]'],
  },
  {
    id: 'trip-modes',
    title: 'How you travel',
    body:
      'Pick driving, walking, biking, or transit. Optimization uses the same mode for every leg.',
    selectors: ['[data-tour="trip-modes"]'],
  },
  {
    id: 'trip-stops',
    title: 'Bookmarked stops',
    body:
      'Toggle which saved places are included. You need at least two selected stops plus a start point to optimize.',
    selectors: ['[data-tour="trip-stops"]'],
  },
  {
    id: 'trip-optimize',
    title: 'Optimize route',
    body:
      'Runs ordering via Google Routes. Results show distance, time, and an Open in Google Maps link.',
    selectors: ['[data-tour="trip-optimize"]'],
  },
];

const TRIP_PLANNER_GUEST: TourStep[] = [
  {
    id: 'trip-welcome',
    title: 'Trip Planner',
    body:
      'Plan an optimized route through your bookmarked businesses. Sign in to load saved places from your account.',
    selectors: [],
  },
  {
    id: 'trip-guest',
    title: 'Sign in first',
    body:
      'Bookmarks live in your account. Sign in here, then come back — your saved places will load automatically.',
    selectors: ['[data-tour="trip-guest"]'],
  },
];

const PORTAL_SIGNED_IN: TourStep[] = [
  {
    id: 'portal-welcome',
    title: 'Business Portal',
    body:
      'Manage claimed listings, post deals and events, and open each place’s full dashboard.',
    selectors: [],
  },
  {
    id: 'portal-header',
    title: 'Your listings',
    body:
      'Use Claim a Business to search the map and verify a venue. Cards below open that place’s portal.',
    selectors: ['[data-tour="portal-header"]'],
  },
  {
    id: 'portal-cards',
    title: 'Place dashboards',
    body:
      'Each card links to profile editing, deals, announcements, analytics, and owner replies.',
    selectors: ['[data-tour="portal-cards"]'],
  },
];

const PORTAL_GUEST: TourStep[] = [
  {
    id: 'portal-welcome',
    title: 'Business Portal',
    body:
      'Claim your Google Business Profile, manage your presence, and engage with customers.',
    selectors: [],
  },
  {
    id: 'portal-guest',
    title: 'Owner sign-in',
    body:
      'Sign in to claim a place and access owner tools. You’ll search the map to verify your business.',
    selectors: ['[data-tour="portal-guest"]'],
  },
];

/**
 * Resolves steps for a route. Trip Planner and Portal depend on guest vs signed-in DOM.
 * Call after mount (e.g. when tour opens) so `document` reflects the current page.
 */
export function getTourStepsForRoute(routeId: string): TourStep[] {
  if (routeId === 'trip-planner') {
    if (typeof document !== 'undefined' && document.querySelector('[data-tour="trip-guest"]')) {
      return TRIP_PLANNER_GUEST;
    }
    return TRIP_PLANNER_SIGNED_IN;
  }
  if (routeId === 'portal') {
    if (typeof document !== 'undefined' && document.querySelector('[data-tour="portal-guest"]')) {
      return PORTAL_GUEST;
    }
    return PORTAL_SIGNED_IN;
  }
  return TOURS_BY_ROUTE[routeId] ?? [];
}
