import Link from "next/link";
import { getServerSession } from "next-auth";
import { BadgeCheck, Gavel, PackageCheck, ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getAuctions, getDashboardMetrics, getListings, roleLabels } from "@/lib/domain";

export const metadata = {
  title: "Espace"
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const metrics = getDashboardMetrics();
  const watchlist = getListings().slice(0, 4);
  const auctions = getAuctions().slice(0, 3);

  if (!session?.user) {
    return (
      <section className="section">
        <div className="panel">
          <h1>Connexion requise</h1>
          <p>Votre espace regroupe offres, favoris, commandes, ventes et messages.</p>
          <Link className="button" href="/connexion">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Espace personnel</p>
          <h1>{session.user.name ?? "Compte Vinovalor"}</h1>
          <p>
            {roleLabels[session.user.role]} · {session.user.isCertified ? "certification active" : "certification à compléter"}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="metric-row">
          <div className="metric-panel">
            <PackageCheck aria-hidden="true" />
            <span>Annonces à suivre</span>
            <strong>{watchlist.length}</strong>
          </div>
          <div className="metric-panel">
            <Gavel aria-hidden="true" />
            <span>Enchères actives</span>
            <strong>{auctions.length}</strong>
          </div>
          <div className="metric-panel">
            <ShieldCheck aria-hidden="true" />
            <span>Score marché</span>
            <strong>{metrics.averageTrust}/100</strong>
          </div>
        </div>
        <div className="dashboard-grid" style={{ marginTop: 22 }}>
          <div className="panel">
            <h2>Actions prioritaires</h2>
            <ul className="timeline">
              <li>
                <span className="timeline__dot">1</span>
                <span>Compléter l'adresse et la preuve d'âge avant achat ou vente.</span>
              </li>
              <li>
                <span className="timeline__dot">2</span>
                <span>Contrôler les offres en attente et les enchères surveillées.</span>
              </li>
              <li>
                <span className="timeline__dot">3</span>
                <span>Préparer les documents de provenance avant publication vendeur.</span>
              </li>
            </ul>
          </div>
          <div className="panel">
            <BadgeCheck aria-hidden="true" />
            <h2>Confiance</h2>
            <p>
              La certification n'est pas un décor : elle doit lier identité, conformité alcool, preuve de provenance et
              historique de transactions.
            </p>
            <Link className="button button--ghost" href="/vendre">
              Préparer une annonce
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
