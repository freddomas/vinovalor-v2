import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { cleanName, getSellerById, getSellerListings } from "@/lib/domain";

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller = getSellerById(id);
  if (!seller) notFound();
  const listings = getSellerListings(id);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Cave vendeur</p>
          <h1>
            {cleanName(seller.firstName)} {cleanName(seller.lastName)}
          </h1>
          <p>
            {seller.isCertified ? "Vendeur certifié" : "Vendeur contrôlé"} · {seller.listingCount} annonce
            {seller.listingCount > 1 ? "s" : ""} · informations publiques limitées.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="proof-grid">
          <div className="panel">
            <BadgeCheck aria-hidden="true" />
            <h3>Certification</h3>
            <p>
              {seller.isCertified
                ? "Identité vendeur et activité contrôlées. Les documents restent privés."
                : "Certification complète recommandée avant mise en avant premium."}
            </p>
          </div>
          <div className="panel">
            <h3>Attentes de confiance</h3>
            <p>Provenance, conservation, factures, défauts et qualité photo doivent rester vérifiables annonce par annonce.</p>
          </div>
          <div className="panel">
            <h3>Activité</h3>
            <p>{listings.length} annonce{listings.length > 1 ? "s" : ""} active{listings.length > 1 ? "s" : ""} sur Vinovalor.</p>
          </div>
        </div>
        <div className="section__header" style={{ marginTop: 42 }}>
          <h2 className="section__title">Annonces actives</h2>
        </div>
        <div className="grid-listings">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </>
  );
}
