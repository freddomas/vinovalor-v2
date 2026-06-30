import { Search } from "lucide-react";
import { getRegions, wineTypeLabels } from "@/lib/domain";

export function FilterBar({
  defaults = {}
}: {
  defaults?: Record<string, string | undefined>;
}) {
  const regions = getRegions();
  const activeCount = Object.values(defaults).filter(Boolean).length;

  return (
    <form className="filterbar" action="/catalogue" aria-label="Filtres catalogue">
      <div className="filterbar__primary">
        <input name="q" defaultValue={defaults.q} placeholder="Bouteille, appellation, vendeur..." aria-label="Recherche" />
        <select name="type" defaultValue={defaults.type ?? ""} aria-label="Type">
          <option value="">Tous types</option>
          {Object.entries(wineTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="button" type="submit">
          <Search size={17} aria-hidden="true" /> Filtrer
        </button>
      </div>
      <div className="filterbar__secondary">
        <select name="region" defaultValue={defaults.region ?? ""} aria-label="Region">
          <option value="">Toutes regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select name="mode" defaultValue={defaults.mode ?? ""} aria-label="Mode de vente">
          <option value="">Tous modes</option>
          <option value="FIXED">Prix fixe</option>
          <option value="AUCTION">Enchere</option>
        </select>
        <select name="certified" defaultValue={defaults.certified ?? ""} aria-label="Certification vendeur">
          <option value="">Tous vendeurs</option>
          <option value="true">Certifies uniquement</option>
        </select>
        <input name="maxPrice" inputMode="numeric" defaultValue={defaults.maxPrice} placeholder="Prix max" aria-label="Prix maximum" />
      </div>
      <p className="filterbar__summary" aria-live="polite">
        {activeCount ? `${activeCount} filtre${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}` : "Aucun filtre actif"}
      </p>
    </form>
  );
}
