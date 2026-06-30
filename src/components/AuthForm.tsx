"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export function AuthForm({ authEnabled, googleEnabled }: { authEnabled: boolean; googleEnabled: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authEnabled) {
      setMessage("Authentification non configuree sur ce deploiement. Ajouter NEXTAUTH_SECRET ou AUTH_SECRET dans Vercel.");
      return;
    }

    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
      callbackUrl: "/espace"
    });
    setPending(false);
    if (result?.ok) {
      window.location.href = "/espace";
      return;
    }
    setMessage("Identifiants invalides ou compte non autorisé.");
  }

  return (
    <div className="auth-panel">
      <p className="eyebrow">Connexion sécurisée</p>
      <h2>Accéder à votre espace</h2>
      <form className="form-grid" onSubmit={submit}>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@vinovalor.local" />
        </div>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="button" type="submit" disabled={pending || !authEnabled} style={{ gridColumn: "1 / -1" }}>
          <LogIn size={17} aria-hidden="true" /> {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      {!authEnabled ? (
        <p className="form-message form-message--error">
          Authentification non configuree sur ce deploiement. Ajouter NEXTAUTH_SECRET ou AUTH_SECRET dans Vercel.
        </p>
      ) : null}
      {message ? <p className="form-message form-message--error">{message}</p> : null}
      <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid var(--border)" }} />
      <button
        className="button button--ghost"
        type="button"
        disabled={!googleEnabled || !authEnabled}
        onClick={() => signIn("google", { callbackUrl: "/espace" })}
        style={{ width: "100%" }}
      >
        Continuer avec Google
      </button>
      {!googleEnabled || !authEnabled ? (
        <p className="section__text">Connexion Google indisponible dans cet environnement.</p>
      ) : null}
    </div>
  );
}
