import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, Gavel, Scale, ShieldCheck, TrendingUp, Wine } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { formatCurrency, getAuctions, getDashboardMetrics, getListings, restaurants } from "@/lib/domain";

export default function HomePage() {
  const metrics = getDashboardMetrics();
  const listings = getListings();
  const featured = listings.slice(0, 6);
  const heroListing = featured[0];
  const auctions = getAuctions().slice(0, 3);

  return (
    <>
      <section className="hero hero--market">
        <div className="hero__content hero__layout">
          <div>
            <p className="hero__eyebrow">Marketplace de caves verifiees</p>
            <h1>Vinovalor</h1>
            <p className="hero__lead">
              Acheter, vendre et suivre des bouteilles d'exception avec provenance, etat, prix, vendeur et niveau de
              preuve visibles avant toute decision.
            </p>
            <div className="hero__actions">
              <Link className="button button--brass" href="/catalogue">
                Explorer le catalogue <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button button--light" href="/vendre">
                Faire valoriser une cave
              </Link>
            </div>
            <div className="hero__trust" aria-label="Garde-fous Vinovalor">
              <span>Score moyen {metrics.averageTrust}/100</span>
              <span>{metrics.certifiedSellers} vendeurs certifies</span>
              <span>{metrics.auctions} encheres suivies</span>
            </div>
          </div>
          {heroListing ? (
            <aside className="asset-ticket" aria-label="Lot mis en avant">
              <div className="asset-ticket__media">
                <Image src={heroListing.image} alt={heroListing.wineName} width={520} height={430} priority />
              </div>
              <div className="asset-ticket__body">
                <div className="listing-card__meta">
                  <span className="badge">{heroListing.typeLabel}</span>
                  <span className="badge badge--green">Preuve {heroListing.proofLevel.toLowerCase()}</span>
                </div>
                <h2>{heroListing.wineName}</h2>
                <p>
                  {heroListing.vintage ? `${heroListing.vintage} · ` : ""}
                  {heroListing.appellation ?? heroListing.regionLabel} · {heroListing.quantity} unite
                  {heroListing.quantity > 1 ? "s" : ""}
                </p>
                <div className="asset-ticket__footer">
                  <span className="price">{formatCurrency(heroListing.price)}</span>
                  <Link className="button button--ghost" href={`/annonces/${heroListing.id}`}>
                    Voir le lot
                  </Link>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="section section--tight" aria-label="Indicateurs Vinovalor">
        <div className="quality-strip">
          <div>
            <span>Valeur catalogue suivie</span>
            <strong>{formatCurrency(metrics.totalValueCents / 100)}</strong>
          </div>
          <div>
            <span>Annonces actives</span>
            <strong>{metrics.listings}</strong>
          </div>
          <div>
            <span>Caves restaurant</span>
            <strong>{metrics.restaurants}</strong>
          </div>
          <div>
            <span>Score confiance moyen</span>
            <strong>{metrics.averageTrust}/100</strong>
          </div>
        </div>
      </section>

      <section className="section section--split">
        <div>
          <p className="eyebrow">Lecture d'actif</p>
          <h2 className="section__title">Une bouteille n'est pas une vignette.</h2>
          <p className="section__text">
            L'interface doit aider a arbitrer un achat : niveau de preuve, conservation, quantite, vendeur, mode de vente
            et contraintes alcool. Cette preview reste volontairement honnete : Postgres, paiement et conformite complete
            ne sont pas encore branches.
          </p>
        </div>
        <div className="assurance-grid" aria-label="Criteres de decision">
          <div className="assurance-item">
            <ClipboardCheck aria-hidden="true" />
            <strong>Preuve avant beaute</strong>
            <span>Photos et donnees lisibles avant effet galerie.</span>
          </div>
          <div className="assurance-item">
            <Scale aria-hidden="true" />
            <strong>Conformite visible</strong>
            <span>Les limites alcool restent explicites, pas enfouies.</span>
          </div>
          <div className="assurance-item">
            <TrendingUp aria-hidden="true" />
            <strong>Tri par confiance</strong>
            <span>Boost, score et prix structurent la priorite.</span>
          </div>
          <div className="assurance-item">
            <Gavel aria-hidden="true" />
            <strong>Encheres cadrees</strong>
            <span>Montant superieur et validation serveur.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Achat immediat</p>
            <h2 className="section__title">Lots avec preuve lisible</h2>
            <p className="section__text">
              Chaque fiche met en avant ce qui compte avant un achat : prix, millesime, quantite, vendeur, preuve et
              disponibilite.
            </p>
          </div>
          <Link className="button button--ghost" href="/catalogue">
            Voir le catalogue
          </Link>
        </div>
        <div className="grid-listings">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="market-lanes">
          <Link href="/catalogue?certified=true">
            <span>Vendeurs certifies</span>
            <strong>Lots priorises par confiance</strong>
          </Link>
          <Link href="/catalogue?mode=AUCTION">
            <span>Encheres</span>
            <strong>Horloge et validation serveur</strong>
          </Link>
          <Link href="/restaurants">
            <span>Caves restaurant</span>
            <strong>{restaurants.length} adresses avec cave associee</strong>
          </Link>
          <Link href="/vendre">
            <span>Vendre</span>
            <strong>Publier sans affaiblir la preuve</strong>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Encheres verifiees</p>
            <h2 className="section__title">Lots rares sous controle</h2>
            <p className="section__text">
              Les encheres visibles restent cadreess : montant superieur au prix courant et validation cote serveur.
            </p>
          </div>
          <Link className="button button--ghost" href="/encheres">
            Encheres actives
          </Link>
        </div>
        <div className="grid-listings">
          {auctions.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="proof-grid">
          <div className="panel panel--feature">
            <ShieldCheck aria-hidden="true" />
            <h3>Protection acheteur</h3>
            <p>Les actions sensibles passent par le serveur : offre, enchere, commande, signalement et moderation.</p>
          </div>
          <div className="panel panel--feature">
            <BadgeCheck aria-hidden="true" />
            <h3>Vendeurs controles</h3>
            <p>Les profils publics restent limites, mais les statuts de certification et la provenance sont visibles.</p>
          </div>
          <div className="panel panel--feature">
            <Wine aria-hidden="true" />
            <h3>Caves et restaurants</h3>
            <p>{restaurants.length} caves restaurant sont conservees comme differenciateur, sans masquer le coeur marketplace.</p>
          </div>
        </div>
      </section>
    </>
  );
}
