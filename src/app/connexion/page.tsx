import { AuthForm } from "@/components/AuthForm";
import { isGoogleAuthConfigured } from "@/lib/auth";

export const metadata = {
  title: "Connexion"
};

export default function LoginPage() {
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
        <AuthForm googleEnabled={isGoogleAuthConfigured()} />
      </div>
    </section>
  );
}
