import Link from "next/link";
import { SellForm } from "@/components/SellForm";
import { can } from "@/lib/domain";
import { getVinovalorSession } from "@/lib/session";

export const metadata = {
  title: "Vendre"
};

export default async function SellPage() {
  const session = await getVinovalorSession();
  const role = session?.user?.role ?? "guest";
  const allowed = can(role, "sell");

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Vendre</p>
          <h1>Publier une bouteille sans fragiliser la confiance</h1>
          <p>
            La publication sépare le brouillon, la preuve visuelle, la conformité alcool et la validation serveur. Une
            annonce incomplète ne doit pas devenir publique.
          </p>
        </div>
      </section>
      <section className="section">
        {!session ? (
          <div className="panel">
            <h2>Connexion requise</h2>
            <p>Connectez-vous pour créer un brouillon, conserver votre provenance et préparer les photos de preuve.</p>
            <Link className="button" href="/connexion">
              Se connecter
            </Link>
          </div>
        ) : allowed ? (
          <div className="detail-layout">
            <SellForm />
            <div className="panel">
              <h2>Critères avant publication</h2>
              <ul className="timeline">
                <li>
                  <span className="timeline__dot">1</span>
                  <span>Identité vendeur et âge légal validés.</span>
                </li>
                <li>
                  <span className="timeline__dot">2</span>
                  <span>Photos obligatoires : face, étiquette, capsule, niveau et défauts.</span>
                </li>
                <li>
                  <span className="timeline__dot">3</span>
                  <span>Prix, stock et mode de vente contrôlés côté serveur.</span>
                </li>
                <li>
                  <span className="timeline__dot">4</span>
                  <span>Publication seulement après modération des images.</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="panel">
            <h2>Rôle insuffisant</h2>
            <p>Votre compte peut acheter et enchérir, mais la vente exige un profil vendeur validé.</p>
          </div>
        )}
      </section>
    </>
  );
}
