"use client";

import { useState } from "react";
import { alcoholWarning, wineTypeLabels } from "@/lib/domain";

export function SellForm() {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { message?: string };
    setPending(false);
    setMessage({
      type: response.ok ? "ok" : "error",
      text: data.message ?? (response.ok ? "Annonce validée." : "Validation impossible.")
    });
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Préparer une annonce vérifiable</h2>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="wineName">Nom de la bouteille</label>
          <input id="wineName" name="wineName" required placeholder="Château, cuvée, maison..." />
        </div>
        <div className="form-field">
          <label htmlFor="wineType">Type</label>
          <select id="wineType" name="wineType" required defaultValue="RED">
            {Object.entries(wineTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="vintage">Millésime</label>
          <input id="vintage" name="vintage" type="number" min="1800" max="2026" placeholder="2018" />
        </div>
        <div className="form-field">
          <label htmlFor="appellation">Appellation</label>
          <input id="appellation" name="appellation" placeholder="Pauillac, Meursault, Champagne..." />
        </div>
        <div className="form-field">
          <label htmlFor="price">Prix</label>
          <input id="price" name="price" type="number" min="1" step="0.01" required placeholder="250" />
        </div>
        <div className="form-field">
          <label htmlFor="quantity">Quantité</label>
          <input id="quantity" name="quantity" type="number" min="1" step="1" required defaultValue="1" />
        </div>
        <div className="form-field">
          <label htmlFor="condition">État</label>
          <select id="condition" name="condition" required defaultValue="EXCELLENT">
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Bon</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="saleMode">Mode de vente</label>
          <select id="saleMode" name="saleMode" required defaultValue="FIXED">
            <option value="FIXED">Prix fixe</option>
            <option value="AUCTION">Enchère</option>
          </select>
        </div>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="storageConditions">Conservation et provenance</label>
          <textarea id="storageConditions" name="storageConditions" placeholder="Cave, température, facture, certificat, défaut visible..." />
        </div>
        <input type="hidden" name="evinMessage" value={alcoholWarning} />
      </div>
      <p className="section__text">
        Les photos face, étiquette, capsule, niveau et défauts visibles seront obligatoires avant publication.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Validation..." : "Valider l'annonce"}
      </button>
      {message ? (
        <p className={`form-message${message.type === "error" ? " form-message--error" : ""}`} role={message.type === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
