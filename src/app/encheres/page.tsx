import { ListingCard } from "@/components/ListingCard";
import { getAuctions } from "@/lib/domain";

export const metadata = {
  title: "Enchères"
};

export default function AuctionsPage() {
  const auctions = getAuctions();
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Enchères</p>
          <h1>Lots suivis par horloge serveur</h1>
          <p>
            Les enchères exigent une transaction atomique, un montant supérieur au prix courant et une clôture côté
            serveur. L'interface expose ces règles au lieu de les cacher.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="grid-listings">
          {auctions.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </>
  );
}
