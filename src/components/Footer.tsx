import Link from "next/link";
import { alcoholWarning } from "@/lib/domain";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <strong>Vinovalor</strong>
          <p>
            Place de marché française pour caves, bouteilles et spiritueux vérifiés. Les transactions sensibles restent
            soumises à la conformité alcool, au contrôle vendeur et à la validation paiement.
          </p>
        </div>
        <div>
          <p>{alcoholWarning}</p>
          <p>
            <Link href="/catalogue">Catalogue</Link> · <Link href="/vendre">Vendre</Link> ·{" "}
            <Link href="/admin">Administration</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
