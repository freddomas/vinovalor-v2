import rawListings from "@/data/listings.json";
import rawRestaurants from "@/data/restaurants.json";
import rawUsers from "@/data/users.json";
import rawVisualManifest from "@/data/visual_manifest.json";
import type { EnrichedListing, Listing, ListingSearch, PublicUser, Restaurant, Role, WineType } from "./types";

type VisualManifestEntry = {
  original_url: string;
  enhanced_path?: string;
  status: string;
};

export const alcoholWarning =
  "L'abus d'alcool est dangereux pour la santé. À consommer avec modération. Vente réservée aux personnes majeures.";

export const wineTypeLabels: Record<WineType, string> = {
  RED: "Rouge",
  WHITE: "Blanc",
  ROSE: "Rosé",
  SPARKLING: "Effervescent",
  COGNAC: "Cognac",
  WHISKY: "Whisky",
  SAKE: "Saké"
};

export const roleLabels: Record<Role, string> = {
  guest: "Invité",
  buyer: "Acheteur",
  seller: "Vendeur",
  certified_seller: "Vendeur certifié",
  restaurant_owner: "Restaurateur",
  restaurant_staff: "Équipe restaurant",
  moderator: "Modération",
  admin: "Administration",
  support: "Support"
};

export const reservationJourney = [
  {
    step: "01",
    title: "Découvrir",
    text: "Rechercher un vin, un domaine, un millésime ou une cave d'établissement."
  },
  {
    step: "02",
    title: "Choisir",
    text: "Comparer la bouteille, le stock, la preuve, le prix et l'adresse qui la propose."
  },
  {
    step: "03",
    title: "Réserver",
    text: "Associer bouteille, table, date, heure et nombre de convives dans le même geste."
  },
  {
    step: "04",
    title: "Sécuriser",
    text: "Préparer le paiement et la garantie sans promettre l'escrow tant que le provider n'est pas branché."
  },
  {
    step: "05",
    title: "Déguster",
    text: "La bouteille devient la raison de venir, puis l'expérience à table prend le relais."
  }
];

export const partnerValuePillars = [
  "Cave transformée en moteur de réservation",
  "Panier moyen porté par la bouteille choisie avant venue",
  "Sommeliers et accords mets-vins rendus visibles",
  "Dashboard pro pour cave, ventes, réservations et clientèle"
];

export const listings = rawListings as Listing[];
export const restaurants = rawRestaurants as Restaurant[];
export const users = rawUsers as PublicUser[];
const manifest = rawVisualManifest as VisualManifestEntry[];

const imageMap = new Map(
  manifest
    .filter((entry) => entry.enhanced_path && entry.status === "downloaded")
    .map((entry) => [
      entry.original_url.split("?")[0],
      `/${entry.enhanced_path!.replaceAll("\\", "/").replace("artifacts/visuals/enhanced/", "media/wines/")}`
    ])
);

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function cleanName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function prettifyWineName(value: string): string {
  return cleanName(value)
    .replaceAll("Chateau", "Château")
    .replaceAll("Romanee", "Romanée")
    .replaceAll("Cote-", "Côte-")
    .replaceAll("Cote Rotie", "Côte-Rôtie")
    .replaceAll("Chateauneuf", "Châteauneuf")
    .replaceAll("Saint-Emilion", "Saint-Émilion")
    .replaceAll("Cremant", "Crémant")
    .replaceAll("Medaillon", "Médaillon")
    .replaceAll("Remy", "Rémy")
    .replaceAll("Perignon", "Pérignon")
    .replaceAll("Annee", "Année");
}

export function formatQuantity(quantity: number): string {
  if (quantity <= 0) return "Stock à confirmer";
  return `${quantity} unité${quantity > 1 ? "s" : ""}`;
}

export function formatCurrency(value: number | string | null | undefined): string {
  const amount = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount >= 1000 ? 0 : 2
  }).format(amount);
}

export function toCents(value: number | string): number {
  const amount = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Le prix doit être positif.");
  }
  return Math.round(amount * 100);
}

export function formatRegion(region: string | null | undefined): string {
  if (!region) return "Région non renseignée";
  const exceptions: Record<string, string> = {
    rhone: "Rhône",
    "sud-ouest": "Sud-Ouest",
    japan: "Japon",
    scotland: "Écosse",
    morocco: "Maroc"
  };
  return exceptions[region] ?? region.charAt(0).toUpperCase() + region.slice(1);
}

export function getImageForListing(listing: Listing): string {
  const firstPhoto = listing.photos[0]?.url;
  if (!firstPhoto) return "/media/wines/001-photo-1569529465841-dfecdab7503b-1600x1000-enhanced.jpg";
  return imageMap.get(firstPhoto.split("?")[0]) ?? "/media/wines/001-photo-1569529465841-dfecdab7503b-1600x1000-enhanced.jpg";
}

export function getRestaurantImage(restaurant: Restaurant): string {
  if (!restaurant.photoUrl) return "/media/wines/015-photo-1414235077428-338989a2e8c0-1600x1000-enhanced.jpg";
  return imageMap.get(restaurant.photoUrl.split("?")[0]) ?? "/media/wines/015-photo-1414235077428-338989a2e8c0-1600x1000-enhanced.jpg";
}

export function computeTrustScore(listing: Listing): number {
  let score = 52;
  if (listing.seller.isCertified) score += 18;
  if (listing.photos.length > 0) score += 10;
  if (listing.appellation) score += 5;
  if (listing.storageConditions) score += 5;
  if (listing.hasWoodCase) score += 4;
  if (listing.restaurantId) score += 3;
  if (listing.condition === "EXCELLENT") score += 3;
  return Math.min(score, 96);
}

export function proofLevel(score: number): EnrichedListing["proofLevel"] {
  if (score >= 84) return "Expert";
  if (score >= 70) return "Renforce";
  return "Essentiel";
}

export function enrichListing(listing: Listing): EnrichedListing {
  const priceCents = toCents(listing.price);
  const trustScore = computeTrustScore(listing);
  return {
    ...listing,
    wineName: prettifyWineName(listing.wineName),
    priceCents,
    image: getImageForListing(listing),
    typeLabel: wineTypeLabels[listing.wineType],
    regionLabel: formatRegion(listing.region),
    conditionLabel: listing.condition === "EXCELLENT" ? "Excellent" : "Bon",
    trustScore,
    proofLevel: proofLevel(trustScore),
    restaurant: restaurants.find((restaurant) => restaurant.id === listing.restaurantId)
  };
}

export function getListings(params: ListingSearch = {}): EnrichedListing[] {
  const query = normalizeText(params.q);
  const type = normalizeText(params.type);
  const region = normalizeText(params.region);
  const mode = normalizeText(params.mode);
  const certified = params.certified === "true";
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  return listings
    .filter((listing) => listing.status === "ACTIVE")
    .map(enrichListing)
    .filter((listing) => {
      const haystack = normalizeText(
        [
          listing.wineName,
          listing.appellation,
          listing.region,
          listing.grapeVariety,
          listing.seller.firstName,
          listing.seller.lastName,
          listing.restaurant?.name
        ].join(" ")
      );

      if (query && !haystack.includes(query)) return false;
      if (type && normalizeText(listing.wineType) !== type) return false;
      if (region && normalizeText(listing.region) !== region) return false;
      if (mode && normalizeText(listing.saleMode) !== mode) return false;
      if (certified && !listing.seller.isCertified) return false;
      if (maxPrice !== null && Number.isFinite(maxPrice) && Number(listing.price) > maxPrice) return false;
      return true;
    })
    .sort((a, b) => Number(b.isBoosted) - Number(a.isBoosted) || b.trustScore - a.trustScore || Number(b.price) - Number(a.price));
}

export function getListingById(id: string): EnrichedListing | undefined {
  const listing = listings.find((item) => item.id === id);
  return listing ? enrichListing(listing) : undefined;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.find((restaurant) => restaurant.id === id);
}

export function getRestaurantListings(id: string): EnrichedListing[] {
  return getListings().filter((listing) => listing.restaurantId === id);
}

export function getRestaurantBottleCount(id: string): number {
  return getRestaurantListings(id).reduce((sum, listing) => sum + Math.max(listing.quantity, 0), 0);
}

export function getSellerById(id: string): PublicUser | undefined {
  return users.find((user) => user.id === id);
}

export function getSellerListings(id: string): EnrichedListing[] {
  return getListings().filter((listing) => listing.sellerId === id);
}

export function getAuctions(): EnrichedListing[] {
  return getListings({ mode: "AUCTION" });
}

export function getRegions(): string[] {
  return Array.from(new Set(listings.map((listing) => listing.region).filter(Boolean) as string[])).sort();
}

export function getDashboardMetrics() {
  const enriched = getListings();
  const auctions = enriched.filter((listing) => listing.saleMode === "AUCTION");
  const fixed = enriched.filter((listing) => listing.saleMode === "FIXED");
  const certifiedSellers = new Set(users.filter((user) => user.isCertified).map((user) => user.id));
  const totalValue = enriched.reduce((sum, listing) => sum + listing.priceCents * listing.quantity, 0);
  return {
    listings: enriched.length,
    restaurants: restaurants.length,
    auctions: auctions.length,
    fixed: fixed.length,
    certifiedSellers: certifiedSellers.size,
    totalValueCents: totalValue,
    averageTrust: Math.round(enriched.reduce((sum, listing) => sum + listing.trustScore, 0) / Math.max(enriched.length, 1))
  };
}

export function assertListingCanBePublished(input: {
  wineName: string;
  wineType: WineType;
  price: number | string;
  quantity: number;
  condition: Listing["condition"];
  saleMode: Listing["saleMode"];
  evinMessage: string;
}): true {
  if (!cleanName(input.wineName)) throw new Error("Le nom de la bouteille est obligatoire.");
  if (!wineTypeLabels[input.wineType]) throw new Error("Le type de produit est invalide.");
  if (toCents(input.price) <= 0) throw new Error("Le prix doit être positif.");
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("La quantité doit être un entier positif.");
  if (!["GOOD", "EXCELLENT"].includes(input.condition)) throw new Error("L'état de la bouteille est invalide.");
  if (!["FIXED", "AUCTION"].includes(input.saleMode)) throw new Error("Le mode de vente est invalide.");
  if (!input.evinMessage || normalizeText(input.evinMessage).length < 20) throw new Error("Le message sanitaire est obligatoire.");
  return true;
}

export function can(role: Role, action: "buy" | "sell" | "bid" | "moderate" | "admin" | "manage_restaurant"): boolean {
  const matrix: Record<typeof action, Role[]> = {
    buy: ["buyer", "seller", "certified_seller", "restaurant_owner", "admin"],
    sell: ["seller", "certified_seller", "restaurant_owner", "admin"],
    bid: ["buyer", "seller", "certified_seller", "restaurant_owner", "admin"],
    moderate: ["moderator", "admin", "support"],
    admin: ["admin"],
    manage_restaurant: ["restaurant_owner", "restaurant_staff", "admin"]
  };
  return matrix[action].includes(role);
}

export function validateBid(currentPriceCents: number, nextBidCents: number, userRole: Role): true {
  if (!can(userRole, "bid")) throw new Error("Vous devez être connecté avec un compte autorisé pour enchérir.");
  if (!Number.isInteger(nextBidCents) || nextBidCents <= currentPriceCents) {
    throw new Error("L'enchère doit être strictement supérieure au prix courant.");
  }
  return true;
}
