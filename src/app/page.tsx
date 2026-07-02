import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Gavel,
  Handshake,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  Utensils,
  Wine
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import {
  formatCurrency,
  getAuctions,
  getDashboardMetrics,
  getListings,
  getRestaurantImage,
  partnerValuePillars,
  reservationJourney,
  restaurants
} from "@/lib/domain";

export default function HomePage() {
  const metrics = getDashboardMetrics();
  const listings = getListings();
  const tableListings = listings.filter((listing) => listing.restaurant).slice(0, 3);
  const featured = listings.slice(0, 3);
  const auctions = getAuctions().slice(0, 3);
  const leadRestaurant = restaurants[0];

  return (
    <>
      <section className="hero hero--cellar">
        <div className="hero__content hero__content--narrow">
          <p className="hero__eyebrow">La vraie valeur du vin et de la cave</p>
          <h1>Vinovalor</h1>
          <p className="hero__lead">
            La bouteille qui vous mène à table. Découvrez une cave, choisissez un flacon, préparez la réservation et
            gardez la preuve visible avant tout paiement réel.
          </p>
          <form className="hero__search" action="/catalogue" aria-label="Recherche Vinovalor">
            <input name="q" placeholder="Vin, domaine, millésime, région..." aria-label="Recherche" />
            <select name="mode" defaultValue="" aria-label="Mode de vente">
              <option value="">Tous parcours</option>
              <option value="FIXED">Réservation ou achat</option>
              <option value="AUCTION">Enchères</option>
            </select>
            <button className="button button--brass" type="submit">
              <Search size={17} aria-hidden="true" /> Découvrir
            </button>
          </form>
          <div className="hero__actions">
            <Link className="button button--light" href="/restaurants">
              Voir les caves restaurant <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button--ghost-dark" href="/vendre">
              Devenir partenaire
            </Link>
          </div>
          <div className="hero__trust" aria-label="Garde-fous Vinovalor">
            <span>{metrics.restaurants} caves restaurant</span>
            <span>{metrics.certifiedSellers} vendeurs certifiés</span>
            <span>Preview sans paiement réel</span>
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-label="Indicateurs Vinovalor">
        <div className="quality-strip quality-strip--reservation">
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

      <section className="section section--split section--intro">
        <div>
          <p className="eyebrow">Parcours fondateur</p>
          <h2 className="section__title">On ne part pas de la table. On part de la bouteille.</h2>
          <p className="section__text">
            Le produit doit rendre visible ce que les plateformes classiques cachent : cave, millésime, disponibilité,
            sommelier, preuve et adresse. Le paiement sécurisé et l'escrow restent des promesses à brancher, pas des
            garanties de cette preview.
          </p>
        </div>
        <div className="experience-panel" aria-label="Promesse Vinovalor">
          <div>
            <Wine aria-hidden="true" />
            <span>Découvrir l'exception</span>
          </div>
          <div>
            <CalendarDays aria-hidden="true" />
            <span>Réserver bouteille et table</span>
          </div>
          <div>
            <LockKeyhole aria-hidden="true" />
            <span>Sécuriser sans sur-promesse</span>
          </div>
          <div>
            <Utensils aria-hidden="true" />
            <span>Déguster à l'adresse choisie</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">De la bouteille à la table</p>
            <h2 className="section__title">Un parcours en cinq décisions.</h2>
          </div>
          <Link className="button button--ghost" href="/catalogue">
            Explorer les lots
          </Link>
        </div>
        <div className="reservation-flow">
          {reservationJourney.map((item) => (
            <article className="flow-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {leadRestaurant ? (
        <section className="section restaurant-feature">
          <div className="restaurant-feature__media">
            <Image src={getRestaurantImage(leadRestaurant)} alt={leadRestaurant.name} width={920} height={620} />
          </div>
          <div className="restaurant-feature__copy">
            <p className="eyebrow">Établissements fondateurs</p>
            <h2 className="section__title">Votre cave devient un motif de réservation.</h2>
            <p className="section__text">
              Les restaurants, hôtels et cavistes ne vendent pas seulement une fiche : ils transforment leur cave en
              vitrine, en argument de venue et en outil de montée en gamme.
            </p>
            <div className="restaurant-feature__facts">
              <span>
                <MapPin size={15} aria-hidden="true" /> {leadRestaurant.city}, {leadRestaurant.country}
              </span>
              <span>
                <Wine size={15} aria-hidden="true" /> {leadRestaurant.bottleCount} bouteilles référencées
              </span>
            </div>
            <Link className="button" href={`/restaurants/${leadRestaurant.id}`}>
              Voir cette cave
            </Link>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Bouteilles à réserver</p>
            <h2 className="section__title">Des flacons qui peuvent déclencher une venue.</h2>
            <p className="section__text">
              Les lots associés à une cave restaurant sont prioritaires pour montrer la promesse centrale : choisir le
              vin avant d'arriver, puis réserver l'expérience.
            </p>
          </div>
          <Link className="button button--ghost" href="/restaurants">
            Caves restaurant
          </Link>
        </div>
        <div className="grid-listings">
          {(tableListings.length ? tableListings : featured).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="section partner-command">
        <div>
          <p className="eyebrow">Tableau de bord pro</p>
          <h2 className="section__title">Piloter la cave, pas seulement publier une annonce.</h2>
          <p className="section__text">
            Les sources partenaires insistent sur réservations, ventes, panier moyen, connaissance client et sécurité.
            La preview expose le socle, mais les revenus temps réel exigent encore Postgres, paiement et conformité.
          </p>
        </div>
        <div className="command-grid">
          {partnerValuePillars.map((pillar, index) => (
            <article className="command-card" key={pillar}>
              {index === 0 ? <Utensils aria-hidden="true" /> : null}
              {index === 1 ? <BarChart3 aria-hidden="true" /> : null}
              {index === 2 ? <BadgeCheck aria-hidden="true" /> : null}
              {index === 3 ? <ShieldCheck aria-hidden="true" /> : null}
              <span>{pillar}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="market-lanes market-lanes--business">
          <Link href="/catalogue?certified=true">
            <span>Confiance</span>
            <strong>Lots priorisés par certification et preuve</strong>
          </Link>
          <Link href="/catalogue?mode=AUCTION">
            <span>Enchères</span>
            <strong>{auctions.length} lots rares avec validation serveur</strong>
          </Link>
          <Link href="/restaurants">
            <span>HORECA</span>
            <strong>{restaurants.length} caves pour choisir une adresse par le vin</strong>
          </Link>
          <Link href="/vendre">
            <span>Partenaires</span>
            <strong>Digitaliser une cave sans affaiblir la preuve</strong>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="proof-grid">
          <div className="panel panel--feature">
            <LockKeyhole aria-hidden="true" />
            <h3>Paiement non simulé</h3>
            <p>La preview prépare le parcours, mais ne prétend pas gérer escrow, dépôt de garantie ou libération fonds.</p>
          </div>
          <div className="panel panel--feature">
            <Handshake aria-hidden="true" />
            <h3>Partenaires fondateurs</h3>
            <p>La valeur pour les établissements vient de la cave visible, du sommelier valorisé et du panier moyen.</p>
          </div>
          <div className="panel panel--feature">
            <Gavel aria-hidden="true" />
            <h3>Extensions cadrées</h3>
            <p>Enchères et livraison sont des relais de croissance, pas le cœur à surcharger avant le parcours table.</p>
          </div>
        </div>
      </section>
    </>
  );
}
