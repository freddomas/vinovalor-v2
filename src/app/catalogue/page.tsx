import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { formatCurrency, getDashboardMetrics, getListings } from "@/lib/domain";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasFilter(defaults: Record<string, string | undefined>): boolean {
  return Object.values(defaults).some(Boolean);
}

export const metadata = {
  title: "Catalogue"
};

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const defaults = {
    q: one(params.q),
    type: one(params.type),
    region: one(params.region),
    mode: one(params.mode),
    certified: one(params.certified),
    maxPrice: one(params.maxPrice)
  };
  const listings = getListings(defaults);
  const metrics = getDashboardMetrics();

  return (
    <>
      <section className="page-hero page-hero--catalogue">
        <div className="page-hero__inner page-hero__grid">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1>{listings.length} lots verifies</h1>
            <p>
              Une grille de decision, pas un mur d'images : preuve, etat, vendeur, quantite, prix et mode de vente
              restent visibles avant l'ouverture d'une fiche.
            </p>
          </div>
          <div className="hero-ledger" aria-label="Resume catalogue">
            <div>
              <span>Valeur suivie</span>
              <strong>{formatCurrency(metrics.totalValueCents / 100)}</strong>
            </div>
            <div>
              <span>Score moyen</span>
              <strong>{metrics.averageTrust}/100</strong>
            </div>
            <div>
              <span>Vendeurs certifies</span>
              <strong>{metrics.certifiedSellers}</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="section catalogue-section">
        <div className="catalogue-toolbar">
          <div>
            <p className="eyebrow">Recherche</p>
            <h2>Affiner sans perdre la lecture du marche</h2>
          </div>
          {hasFilter(defaults) ? (
            <a className="button button--ghost" href="/catalogue">
              Reinitialiser
            </a>
          ) : null}
        </div>
        <FilterBar defaults={defaults} />
        {listings.length ? (
          <div className="grid-listings">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Aucun lot ne correspond a ces criteres.</strong>
            <span>Elargissez la region, le mode de vente ou le prix maximum pour retrouver des annonces actives.</span>
          </div>
        )}
      </section>
    </>
  );
}
