import { AuthForm } from "@/components/AuthForm";
import { hasAuthSecret, isGoogleAuthConfigured, isLocalCredentialsConfigured } from "@/lib/auth";

export const metadata = {
  title: "Connexion"
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/espace";
  return next;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const callbackUrl = safeNext(params.next);

  return (
    <section className="section">
      <div className="auth-layout">
        <div className="auth-copy">
          <div>
            <p className="eyebrow">Accès sécurisé</p>
            <h1>Reprendre un achat, une enchère ou une publication.</h1>
            <p>
              La connexion garde le contexte métier : offres, favoris, messages, commandes, modération et publication.
            </p>
          </div>
        </div>
        <AuthForm
          authEnabled={hasAuthSecret()}
          googleEnabled={isGoogleAuthConfigured()}
          localEnabled={isLocalCredentialsConfigured()}
          callbackUrl={callbackUrl}
        />
      </div>
    </section>
  );
}
