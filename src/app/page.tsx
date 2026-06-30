import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Wine } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import { formatCurrency, getAuctions, getDashboardMetrics, getListings, restaurants } from "@/lib/domain";

export default function HomePage() {
  const metrics = getDashboardMetrics();
  const featured = getListings().slice(0, 6);
  const auctions = getAuctions().slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Marketplace de caves vérifiées</p>
          <h1>Vinovalor</h1>
          <p className="hero__lead">
            Achetez, vendez et suivez des bouteilles d'exception avec une lecture claire de la provenance, du vendeur,
            de l'état, du prix et du niveau de preuve.
          </p>
          <form className="hero__search" action="/catalogue">
            <input name="q" placeholder="Rechercher une bouteille, une appellation, un millésime..." aria-label="Recherche catalogue" />
            <select name="mode" defaultValue="" aria-label="Mode de vente">
              <option value="">Tous modes</option>
              <option value="FIXED">Prix fixe</option>
              <option value="AUCTION">Enchères</option>
            </select>
            <button className="button button--brass" type="submit">
              Explorer <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <section className="section section--tight" aria-label="Indicateurs Vinovalor">
        <div className="stats-grid">
          <div className="stat-card">
            <span>Annonces actives</span>
            <strong>{metrics.listings}</strong>
          </div>
          <div className="stat-card">
            <span>Valeur catalogue</span>
            <strong>{formatCurrency(metrics.totalValueCents / 100)}</strong>
          </div>
          <div className="stat-card">
            <span>Vendeurs certifiés</span>
            <strong>{metrics.certifiedSellers}</strong>
          </div>
          <div className="stat-card">
            <span>Score confiance moyen</span>
            <strong>{metrics.averageTrust}/100</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Achat immédiat</p>
            <h2 className="section__title">Bouteilles avec preuve lisible</h2>
            <p className="section__text">
              Chaque carte expose les éléments qui comptent avant un achat : état, quantité, vendeur, mode de vente,
              score de confiance et disponibilité.
            </p>
          </div>
          <Link className="button button--ghost" href="/catalogue">
            Voir tout
          </Link>
        </div>
        <div className="grid-listings">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Recherche opérationnelle</p>
          <h1>Filtrer vite, décider mieux.</h1>
          <p>
            La recherche conserve les critères essentiels de la marketplace : type, région, mode de vente, certification
            vendeur et prix maximum.
          </p>
          <div style={{ marginTop: 24 }}>
            <FilterBar />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Enchères</p>
            <h2 className="section__title">Lots où le serveur doit trancher</h2>
            <p className="section__text">
              Les enchères sont visibles comme expérience produit, avec une règle stricte : montant supérieur au prix
              courant et validation serveur obligatoire.
            </p>
          </div>
          <Link className="button button--ghost" href="/encheres">
            Enchères actives
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
          <div className="panel">
            <ShieldCheck aria-hidden="true" />
            <h3>Protection acheteur</h3>
            <p>Les actions sensibles passent par le serveur : offre, enchère, commande, signalement et modération.</p>
          </div>
          <div className="panel">
            <BadgeCheck aria-hidden="true" />
            <h3>Vendeurs contrôlés</h3>
            <p>Les profils publics restent limités, mais les statuts de certification et la provenance sont visibles.</p>
          </div>
          <div className="panel">
            <Wine aria-hidden="true" />
            <h3>Caves et restaurants</h3>
            <p>{restaurants.length} caves restaurant sont conservées comme différenciateur, sans masquer le coeur marketplace.</p>
          </div>
        </div>
      </section>
    </>
  );
}
