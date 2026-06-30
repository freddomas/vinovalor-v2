import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { getRestaurantImage, restaurants } from "@/lib/domain";

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
          <h1>Restaurants avec cave associee</h1>
          <p>
            Un module differenciant pour relier une adresse, une cave visible et des bouteilles disponibles. La
            reservation et le paiement restent a brancher avant usage transactionnel reel.
          </p>
        </div>
        {leadRestaurant ? (
          <Link className="restaurant-hero__media" href={`/restaurants/${leadRestaurant.id}`}>
            <Image src={getRestaurantImage(leadRestaurant)} alt={leadRestaurant.name} width={760} height={520} priority />
            <span>{leadRestaurant.name}</span>
          </Link>
        ) : null}
      </section>
      <section className="section">
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
                    <strong>{restaurant.bottleCount}</strong> bouteille{restaurant.bottleCount > 1 ? "s" : ""}
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
