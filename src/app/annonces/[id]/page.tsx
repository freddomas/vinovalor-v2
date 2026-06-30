import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Heart, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { BidPanel } from "@/components/BidPanel";
import { alcoholWarning, formatCurrency, formatQuantity, getListingById } from "@/lib/domain";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListingById(id);
  return {
    title: listing ? listing.wineName : "Annonce"
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) notFound();

  return (
    <section className="section">
      <div className="detail-layout">
        <div className="detail-media">
          <div className="detail-media__main">
            <Image src={listing.image} alt={listing.wineName} width={900} height={820} priority />
          </div>
        </div>
        <div className="detail-summary panel">
          <div className="listing-card__meta">
            <span className="badge">{listing.typeLabel}</span>
            <span className="badge badge--green">{listing.conditionLabel}</span>
            {listing.seller.isCertified ? (
              <span className="badge badge--green">
                <BadgeCheck size={14} aria-hidden="true" /> Vendeur certifié
              </span>
            ) : null}
          </div>
          <h1>{listing.wineName}</h1>
          <p className="section__text">
            {listing.vintage ? `${listing.vintage} · ` : ""}
            {listing.appellation ?? listing.regionLabel} · {listing.volume} cl · {formatQuantity(listing.quantity)}
          </p>
          <span className="price">{formatCurrency(listing.price)}</span>
          <div className="detail-facts">
            <div className="fact">
              <span>Score de confiance</span>
              <strong>{listing.trustScore}/100</strong>
            </div>
            <div className="fact">
              <span>Niveau de preuve</span>
              <strong>{listing.proofLevel}</strong>
            </div>
            <div className="fact">
              <span>Vendeur</span>
              <strong>
                <Link href={`/vendeurs/${listing.sellerId}`}>
                  {listing.seller.firstName.trim()} {listing.seller.lastName.trim()}
                </Link>
              </strong>
            </div>
            <div className="fact">
              <span>Mode</span>
              <strong>{listing.saleMode === "AUCTION" ? "Enchère" : "Prix fixe"}</strong>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
            <Link className="button" href="/connexion">
              Acheter
            </Link>
            {listing.allowOffers ? (
              <Link className="button button--ghost" href="/connexion">
                Faire une offre
              </Link>
            ) : null}
            <Link className="button button--ghost" href="/connexion" aria-label="Ajouter aux favoris">
              <Heart size={17} aria-hidden="true" /> Favori
            </Link>
            <Link className="button button--ghost" href="/connexion">
              <MessageCircle size={17} aria-hidden="true" /> Contacter
            </Link>
          </div>
          {listing.saleMode === "AUCTION" ? <div style={{ marginTop: 18 }}><BidPanel auctionId={listing.id} currentPrice={Number(listing.price)} /></div> : null}
        </div>
      </div>

      <div className="page-section">
        <div className="proof-grid">
          <div className="panel">
            <ShieldCheck aria-hidden="true" />
            <h3>Preuves attendues</h3>
            <p>Face bouteille, étiquette, contre-étiquette, capsule, niveau et défauts visibles avant publication finale.</p>
          </div>
          <div className="panel">
            <Truck aria-hidden="true" />
            <h3>Livraison</h3>
            <p>
              {listing.deliveryStandard ? "Livraison standard disponible. " : ""}
              {listing.deliveryPickup ? "Retrait disponible. " : ""}
              Les frais et restrictions alcool doivent être validés au paiement.
            </p>
          </div>
          <div className="panel">
            <h3>Conformité</h3>
            <p>{alcoholWarning}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
