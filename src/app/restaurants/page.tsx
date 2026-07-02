import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LockKeyhole, MapPin, Star, Utensils, Wine } from "lucide-react";
import { getRestaurantBottleCount, getRestaurantImage, restaurants } from "@/lib/domain";

export const metadata = {
  title: "Restaurants"
};

export default function RestaurantsPage() {
  const leadRestaurant = restaurants[0];

  return (
    <>
      <section className="restaurant-hero">
        <div className="restaurant-hero__copy">
          <p className="eyebrow">Caves restaurant</p>
          <h1>Choisir une table par sa cave.</h1>
          <p>
            Le cœur métier Vinovalor n'est pas un annuaire HORECA. L'utilisateur part d'une bouteille, découvre
            l'établissement qui la propose, puis prépare sa venue. La réservation et le paiement restent à brancher
            avant usage transactionnel réel.
          </p>
          <div className="restaurant-journey" aria-label="Parcours cave restaurant">
            <span>
              <Wine size={16} aria-hidden="true" /> Choisir le flacon
            </span>
            <span>
              <CalendarDays size={16} aria-hidden="true" /> Préparer la date
            </span>
            <span>
              <Utensils size={16} aria-hidden="true" /> Arriver à table
            </span>
          </div>
        </div>
        {leadRestaurant ? (
          <Link className="restaurant-hero__media" href={`/restaurants/${leadRestaurant.id}`}>
            <Image src={getRestaurantImage(leadRestaurant)} alt={leadRestaurant.name} width={760} height={520} priority />
            <span>{leadRestaurant.name}</span>
          </Link>
        ) : null}
      </section>
      <section className="section">
        <div className="section__header">
          <div>
            <p className="eyebrow">Établissements visibles</p>
            <h2 className="section__title">La cave devient un critère de choix.</h2>
          </div>
          <div className="status-note">
            <LockKeyhole size={18} aria-hidden="true" />
            <span>Paiement sécurisé non actif dans cette preview.</span>
          </div>
        </div>
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article className="restaurant-card restaurant-card--editorial" key={restaurant.id}>
              <Link className="restaurant-card__image" href={`/restaurants/${restaurant.id}`} aria-label={`Voir ${restaurant.name}`}>
                <Image src={getRestaurantImage(restaurant)} alt={restaurant.name} width={720} height={500} />
              </Link>
              <div className="restaurant-card__body">
                <span className="badge">
                  <MapPin size={14} aria-hidden="true" /> {restaurant.city}, {restaurant.country}
                </span>
                <h3>
                  <Link href={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                </h3>
                <p className="section__text">{restaurant.description}</p>
                <div className="restaurant-card__meta">
                  <span>
                <strong>{getRestaurantBottleCount(restaurant.id)}</strong> bouteille
                {getRestaurantBottleCount(restaurant.id) > 1 ? "s" : ""} reliée
                {getRestaurantBottleCount(restaurant.id) > 1 ? "s" : ""}
                  </span>
                  <span>
                    <Star size={14} aria-hidden="true" /> {restaurant.rating}/5
                  </span>
                </div>
                <Link className="button button--ghost" href={`/restaurants/${restaurant.id}`}>
                  Voir la cave
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
