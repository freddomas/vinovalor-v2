import Link from "next/link";
import { Gavel, Home, LogIn, LogOut, Search, UserRound, Wine } from "lucide-react";
import type { Session } from "next-auth";

const navItems = [
  { href: "/catalogue", label: "Acheter" },
  { href: "/vendre", label: "Vendre" },
  { href: "/encheres", label: "Enchères" },
  { href: "/restaurants", label: "Restaurants" },
  { href: "/espace", label: "Espace" }
];

export function Header({ session }: { session: Session | null }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <Link className="brand" href="/" aria-label="Accueil Vinovalor">
            <span className="brand__mark">V</span>
            <span className="brand__name">Vinovalor</span>
          </Link>
          <nav className="nav" aria-label="Navigation principale">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__actions">
            <Link className="button button--light" href="/catalogue">
              <Search size={17} aria-hidden="true" /> Rechercher
            </Link>
          <Link className="button button--ghost" href={session ? "/espace" : "/connexion"}>
            {session ? "Mon compte" : "Connexion"}
          </Link>
          {session ? (
            <form className="logout-form" action="/api/auth/logout" method="post">
              <button className="button button--ghost" type="submit">
                <LogOut size={17} aria-hidden="true" />
                Déconnexion
              </button>
            </form>
          ) : null}
        </div>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Navigation mobile">
        <Link href="/" aria-label="Accueil">
          <Home size={21} />
        </Link>
        <Link href="/catalogue" aria-label="Recherche">
          <Search size={21} />
        </Link>
        <Link href="/vendre" aria-label="Vendre">
          <Wine size={21} />
        </Link>
        <Link href="/encheres" aria-label="Enchères">
          <Gavel size={21} />
        </Link>
        <Link href="/espace" aria-label="Compte">
          {session ? <UserRound size={21} /> : <LogIn size={21} />}
        </Link>
        {session ? (
          <form className="mobile-nav__form" action="/api/auth/logout" method="post">
            <button type="submit" aria-label="Déconnexion">
              <LogOut size={21} />
            </button>
          </form>
        ) : null}
      </nav>
    </>
  );
}
