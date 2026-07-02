import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, CheckCircle2, Heart, LockKeyhole, MessageCircle, ShieldCheck, Truck, Utensils } from "lucide-react";
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
  const nextUrl = encodeURIComponent(`/annonces/${listing.id}`);

  const proofItems = [
    { label: "Photo principale", ok: listing.photos.length > 0 },
    { label: "Appellation renseignée", ok: Boolean(listing.appellation) },
    { label: "Vendeur certifié", ok: listing.seller.isCertified },
    { label: "Conservation documentée", ok: Boolean(listing.storageConditions) },
    { label: "Cave restaurant associée", ok: Boolean(listing.restaurant) }
  ];

  return (
    <section className="section">
      <div className="detail-layout detail-layout--premium">
        <div className="detail-media">
          <div className="detail-media__main">
            <Image src={listing.image} alt={listing.wineName} width={900} height={820} priority />
          </div>
          <div className="detail-proof-strip">
            <span>Score {listing.trustScore}/100</span>
            <span>Preuve {listing.proofLevel.toLowerCase()}</span>
            <span>{listing.saleMode === "AUCTION" ? "Enchère" : "Prix fixe"}</span>
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
          <div className="decision-panel">
            <div>
              <span>Prix affiché</span>
              <strong>{formatCurrency(listing.price)}</strong>
            </div>
            <div>
              <span>Confiance</span>
              <strong>{listing.trustScore}/100</strong>
            </div>
            <div>
              <span>Preuve</span>
              <strong>{listing.proofLevel}</strong>
            </div>
            <div>
              <span>Disponibilité</span>
              <strong>{formatQuantity(listing.quantity)}</strong>
            </div>
          </div>
          {listing.restaurant ? (
            <div className="table-reservation-panel" aria-label="Préparation de réservation à table">
              <Utensils aria-hidden="true" />
            <div>
              <strong>Cette bouteille peut guider une venue chez {listing.restaurant.name}.</strong>
              <span>
                La sélection bouteille + table + date reste en préparation : aucune garantie de réservation ou de
                paiement n'est simulée ici.
              </span>
              <div className="reservation-form-preview" aria-label="Prévisualisation réservation">
                <label>
                  Date
                  <input type="date" disabled aria-label="Date de venue non active en preview" />
                </label>
                <label>
                  Heure
                  <select disabled aria-label="Heure de venue non active en preview">
                    <option>19:00</option>
                  </select>
                </label>
                <label>
                  Convives
                  <select disabled aria-label="Nombre de convives non actif en preview">
                    <option>2</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          ) : null}
          <div className="detail-actions">
            <Link className="button" href={`/connexion?next=${nextUrl}`}>
              {listing.restaurant ? "Préparer la réservation" : "Préparer l'achat"}
            </Link>
            {listing.allowOffers ? (
              <Link className="button button--ghost" href={`/connexion?next=${nextUrl}`}>
                Faire une offre
              </Link>
            ) : null}
            <Link className="button button--ghost" href={`/connexion?next=${nextUrl}`} aria-label="Ajouter aux favoris">
              <Heart size={17} aria-hidden="true" /> Favori
            </Link>
            <Link className="button button--ghost" href={`/connexion?next=${nextUrl}`}>
              <MessageCircle size={17} aria-hidden="true" /> Contacter
            </Link>
          </div>
          {listing.saleMode === "AUCTION" ? (
            <div className="bid-panel-wrap">
              <BidPanel auctionId={listing.id} currentPrice={Number(listing.price)} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="page-section detail-grid">
        <div className="panel panel--feature">
          <h2>Profil produit</h2>
          <div className="detail-facts">
            <div className="fact">
              <span>Région</span>
              <strong>{listing.regionLabel}</strong>
            </div>
            <div className="fact">
              <span>Cépage</span>
              <strong>{listing.grapeVariety ?? "Non renseigné"}</strong>
            </div>
            <div className="fact">
              <span>Caisse bois</span>
              <strong>{listing.hasWoodCase ? "Oui" : "Non"}</strong>
            </div>
            <div className="fact">
              <span>Bio</span>
              <strong>{listing.isOrganic ? "Oui" : "Non"}</strong>
            </div>
          </div>
          {listing.tastingNotes ? <p className="section__text">{listing.tastingNotes}</p> : null}
        </div>

        <div className="panel panel--feature">
          <ShieldCheck aria-hidden="true" />
          <h2>Checklist de preuve</h2>
          <ul className="proof-list">
            {proofItems.map((item) => (
              <li key={item.label} className={item.ok ? "is-ok" : ""}>
                <CheckCircle2 size={17} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel panel--feature">
          <Truck aria-hidden="true" />
          <h2>Livraison et conformité</h2>
          <p>
            {listing.deliveryStandard ? "Livraison standard disponible. " : ""}
            {listing.deliveryPickup ? "Retrait disponible. " : ""}
            Les frais, l'âge légal et les restrictions alcool doivent être validés au paiement.
          </p>
          <p>{alcoholWarning}</p>
        </div>
        <div className="panel panel--feature">
          <CalendarDays aria-hidden="true" />
          <h2>Réservation</h2>
          <p>
            Le parcours cible associe bouteille, table, date, heure et convives. Cette version affiche le contexte, mais
            n'enregistre pas encore de réservation durable.
          </p>
          <p>
            <LockKeyhole size={15} aria-hidden="true" /> Paiement sécurisé et dépôt de garantie attendent le provider
            compatible alcool.
          </p>
        </div>
      </div>

      <div className="sticky-purchase" aria-label="Actions d'achat">
        <span>{formatCurrency(listing.price)}</span>
        <Link className="button" href={`/connexion?next=${nextUrl}`}>
          {listing.restaurant ? "Préparer" : "Acheter"}
        </Link>
      </div>
    </section>
  );
}
