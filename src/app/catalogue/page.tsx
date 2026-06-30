import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { getListings } from "@/lib/domain";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Catalogue</p>
          <h1>{listings.length} bouteilles et spiritueux vérifiés</h1>
          <p>
            Le catalogue privilégie la lisibilité commerciale : preuve, état, vendeur, quantité, prix et mode de vente
            avant les effets visuels.
          </p>
        </div>
      </section>
      <section className="section">
        <FilterBar defaults={defaults} />
        {listings.length ? (
          <div className="grid-listings">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Aucun résultat ne correspond aux filtres sélectionnés.</div>
        )}
      </section>
    </>
  );
}
