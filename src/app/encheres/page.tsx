import { Gavel, ServerCog, ShieldCheck } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { formatCurrency, getAuctions } from "@/lib/domain";

export const metadata = {
  title: "Encheres"
};

export default function AuctionsPage() {
  const auctions = getAuctions();
  const auctionValue = auctions.reduce((sum, listing) => sum + listing.priceCents * listing.quantity, 0);

  return (
    <>
      <section className="auction-hero">
        <div>
          <p className="eyebrow">Encheres verifiees</p>
          <h1>Lots rares sous controle serveur</h1>
          <p>
            Pas de fausse horloge : les donnees actuelles exposent le prix courant, la preuve et la validation serveur.
            La cloture temps reel devra etre branchee avant production transactionnelle.
          </p>
        </div>
        <div className="auction-board" aria-label="Resume encheres">
          <div>
            <Gavel aria-hidden="true" />
            <span>Lots actifs</span>
            <strong>{auctions.length}</strong>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>Valeur suivie</span>
            <strong>{formatCurrency(auctionValue / 100)}</strong>
          </div>
          <div>
            <ServerCog aria-hidden="true" />
            <span>Regle</span>
            <strong>Offre superieure</strong>
          </div>
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
