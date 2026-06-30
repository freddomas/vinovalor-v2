export type Role =
  | "guest"
  | "buyer"
  | "seller"
  | "certified_seller"
  | "restaurant_owner"
  | "restaurant_staff"
  | "moderator"
  | "admin"
  | "support";

export type WineType = "RED" | "WHITE" | "ROSE" | "SPARKLING" | "COGNAC" | "WHISKY" | "SAKE";
export type SaleMode = "FIXED" | "AUCTION";
export type ListingCondition = "GOOD" | "EXCELLENT";
export type ListingStatus = "DRAFT" | "ACTIVE" | "RESERVED" | "SOLD" | "SUSPENDED";

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  isCertified: boolean;
  createdAt: string;
  listingCount: number;
  role?: Role;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  street: string;
  city: string;
  country: string;
  phone: string | null;
  photoUrl: string | null;
  rating: string;
  createdAt: string;
  updatedAt: string;
  bottleCount: number;
}

export interface ListingPhoto {
  id: string;
  url: string;
  cdnUrl: string | null;
  position: number;
  listingId: string;
}

export interface ListingSeller {
  id: string;
  firstName: string;
  lastName: string;
  isCertified: boolean;
}

export interface Listing {
  id: string;
  sellerId: string;
  restaurantId: string | null;
  wineName: string;
  wineType: WineType;
  vintage: number | null;
  appellation: string | null;
  region: string | null;
  grapeVariety: string | null;
  tastingNotes: string | null;
  volume: number;
  isOrganic: boolean;
  hasWoodCase: boolean;
  storageConditions: string | null;
  price: string;
  quantity: number;
  condition: ListingCondition;
  saleMode: SaleMode;
  allowOffers: boolean;
  status: ListingStatus;
  deliveryStandard: boolean;
  deliveryExpress: boolean;
  deliveryPickup: boolean;
  pickupAddress: string | null;
  pickupSlots: string | null;
  reservePrice: string | null;
  targetPrice: string | null;
  evinMessage: string;
  isBoosted: boolean;
  createdAt: string;
  updatedAt: string;
  photos: ListingPhoto[];
  seller: ListingSeller;
}

export interface EnrichedListing extends Listing {
  priceCents: number;
  image: string;
  typeLabel: string;
  regionLabel: string;
  conditionLabel: string;
  trustScore: number;
  proofLevel: "Essentiel" | "Renforce" | "Expert";
  restaurant?: Restaurant;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isCertified: boolean;
}

export interface ListingSearch {
  q?: string;
  type?: string;
  region?: string;
  mode?: string;
  certified?: string;
  maxPrice?: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  metadata: Record<string, string | number | boolean | null>;
}
