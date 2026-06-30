import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Gavel, ShieldCheck } from "lucide-react";
import { formatCurrency, formatQuantity } from "@/lib/domain";
import type { EnrichedListing } from "@/lib/types";

export function ListingCard({ listing }: { listing: EnrichedListing }) {
  return (
    <article className="listing-card">
      <Link href={`/annonces/${listing.id}`} className="listing-card__image" aria-label={`Voir ${listing.wineName}`}>
        <Image src={listing.image} alt={listing.wineName} width={720} height={610} sizes="(max-width: 680px) 100vw, 33vw" />
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__meta">
          <span className="badge">{listing.typeLabel}</span>
          {listing.saleMode === "AUCTION" ? (
            <span className="badge badge--blue">
              <Gavel size={14} aria-hidden="true" /> Enchère
            </span>
          ) : (
            <span className="badge badge--green">Prix fixe</span>
          )}
          {listing.seller.isCertified ? (
            <span className="badge badge--green">
              <BadgeCheck size={14} aria-hidden="true" /> Certifié
            </span>
          ) : null}
        </div>
        <h3>
          <Link href={`/annonces/${listing.id}`}>{listing.wineName}</Link>
        </h3>
        <p className="listing-card__line">
          {listing.vintage ? `${listing.vintage} · ` : ""}
          {listing.appellation ?? listing.regionLabel} · {listing.conditionLabel}
        </p>
        <p className="listing-card__line">
          {formatQuantity(listing.quantity)} · Vendeur {listing.seller.isCertified ? "vérifié" : "contrôlé"}
        </p>
        <div className="listing-card__footer">
          <div>
            <span className="price">{formatCurrency(listing.price)}</span>
            <small>
              <ShieldCheck size={14} aria-hidden="true" /> Preuve {listing.proofLevel.toLowerCase()} · score {listing.trustScore}/100
            </small>
          </div>
          <Link className="button button--ghost" href={`/annonces/${listing.id}`}>
            Voir
          </Link>
        </div>
      </div>
    </article>
  );
}
