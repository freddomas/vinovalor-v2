import Image from "next/image";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { getRestaurantById, getRestaurantImage, getRestaurantListings } from "@/lib/domain";

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = getRestaurantById(id);
  if (!restaurant) notFound();
  const listings = getRestaurantListings(id);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Restaurant</p>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="detail-layout">
          <div className="detail-media__main">
            <Image
              src={getRestaurantImage(restaurant)}
              alt={restaurant.name}
              width={900}
              height={620}
            />
          </div>
          <div className="panel">
            <h2>Informations cave</h2>
            <div className="detail-facts">
              <div className="fact">
                <span>Ville</span>
                <strong>{restaurant.city}</strong>
              </div>
              <div className="fact">
                <span>Pays</span>
                <strong>{restaurant.country}</strong>
              </div>
              <div className="fact">
                <span>Note</span>
                <strong>{restaurant.rating}/5</strong>
              </div>
              <div className="fact">
                <span>Cave</span>
                <strong>{listings.length} annonce{listings.length > 1 ? "s" : ""}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="section__header" style={{ marginTop: 42 }}>
          <h2 className="section__title">Bouteilles associées</h2>
        </div>
        {listings.length ? (
          <div className="grid-listings">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Aucune bouteille active n'est rattachée à cette cave.</div>
        )}
      </section>
    </>
  );
}
