import Image from "next/image";
import Link from "next/link";
import { getRestaurantImage, restaurants } from "@/lib/domain";

export const metadata = {
  title: "Restaurants"
};

export default function RestaurantsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Caves restaurant</p>
          <h1>Restaurants avec cave associée</h1>
          <p>
            Les restaurants restent un module différenciant : cave visible, bouteilles disponibles et retrait/réservation
            lorsque les règles opérationnelles sont verrouillées.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article className="restaurant-card" key={restaurant.id}>
              <Link className="restaurant-card__image" href={`/restaurants/${restaurant.id}`} aria-label={`Voir ${restaurant.name}`}>
                <Image
                  src={getRestaurantImage(restaurant)}
                  alt={restaurant.name}
                  width={720}
                  height={500}
                />
              </Link>
              <div className="restaurant-card__body">
                <span className="badge">{restaurant.city}, {restaurant.country}</span>
                <h3>
                  <Link href={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                </h3>
                <p className="section__text">{restaurant.description}</p>
                <p>
                  <strong>{restaurant.bottleCount}</strong> bouteille{restaurant.bottleCount > 1 ? "s" : ""} · note {restaurant.rating}/5
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
