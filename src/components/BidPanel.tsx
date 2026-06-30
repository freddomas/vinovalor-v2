"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";

export function BidPanel({ auctionId, currentPrice }: { auctionId: string; currentPrice: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auctions/${auctionId}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(form.get("amount")) })
    });
    const data = (await response.json()) as { message?: string };
    setPending(false);
    setMessage(data.message ?? "Réponse reçue.");
  }

  return (
    <form onSubmit={submit} className="panel">
      <h3>Placer une enchère</h3>
      <div className="form-field">
        <label htmlFor={`amount-${auctionId}`}>Montant supérieur au prix courant</label>
        <input id={`amount-${auctionId}`} name="amount" type="number" min={currentPrice + 1} step="1" required />
      </div>
      <button className="button" type="submit" disabled={pending}>
        <Gavel size={17} aria-hidden="true" /> {pending ? "Vérification..." : "Enchérir"}
      </button>
      {message ? (
        <p className="form-message" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
