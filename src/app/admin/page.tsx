import Link from "next/link";
import { getDashboardMetrics, getListings, users } from "@/lib/domain";
import { getVinovalorSession } from "@/lib/session";

export const metadata = {
  title: "Administration"
};

export default async function AdminPage() {
  const session = await getVinovalorSession();
  if (!session?.user) {
    return (
      <section className="section">
        <div className="panel">
          <h1>Administration protégée</h1>
          <p>Connectez-vous avec un compte autorisé.</p>
          <Link className="button" href="/connexion">
            Connexion
          </Link>
        </div>
      </section>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <section className="section">
        <div className="panel">
          <h1>Accès refusé</h1>
          <p>Les fonctions de modération et de configuration marketplace exigent un rôle administrateur.</p>
        </div>
      </section>
    );
  }

  const metrics = getDashboardMetrics();
  const lowProof = getListings().filter((listing) => listing.trustScore < 70);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Administration</p>
          <h1>Contrôle marketplace</h1>
          <p>Vue de supervision pour modération, qualité des annonces, conformité et auditabilité.</p>
        </div>
      </section>
      <section className="section">
        <div className="metric-row">
          <div className="metric-panel">
            <span>Annonces</span>
            <strong>{metrics.listings}</strong>
          </div>
          <div className="metric-panel">
            <span>Utilisateurs publics</span>
            <strong>{users.length}</strong>
          </div>
          <div className="metric-panel">
            <span>Annonces à renforcer</span>
            <strong>{lowProof.length}</strong>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 22 }}>
          <h2>File de contrôle</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <th align="left">Annonce</th>
                  <th align="left">Vendeur</th>
                  <th align="left">Score</th>
                  <th align="left">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowProof.slice(0, 8).map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.wineName}</td>
                    <td>
                      {listing.seller.firstName.trim()} {listing.seller.lastName.trim()}
                    </td>
                    <td>{listing.trustScore}/100</td>
                    <td>Demander preuves complémentaires</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
