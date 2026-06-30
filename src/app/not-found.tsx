import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="panel">
        <p className="eyebrow">Introuvable</p>
        <h1>Cette page ou cette annonce n'existe pas.</h1>
        <Link className="button" href="/catalogue">
          Retour au catalogue
        </Link>
      </div>
    </section>
  );
}
