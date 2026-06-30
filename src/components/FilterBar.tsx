import { Search } from "lucide-react";
import { getRegions, wineTypeLabels } from "@/lib/domain";

export function FilterBar({
  defaults = {}
}: {
  defaults?: Record<string, string | undefined>;
}) {
  const regions = getRegions();
  return (
    <form className="filterbar" action="/catalogue">
      <input name="q" defaultValue={defaults.q} placeholder="Bouteille, appellation, vendeur..." aria-label="Recherche" />
      <select name="type" defaultValue={defaults.type ?? ""} aria-label="Type">
        <option value="">Tous types</option>
        {Object.entries(wineTypeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select name="region" defaultValue={defaults.region ?? ""} aria-label="Région">
        <option value="">Toutes régions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <select name="mode" defaultValue={defaults.mode ?? ""} aria-label="Mode de vente">
        <option value="">Tous modes</option>
        <option value="FIXED">Prix fixe</option>
        <option value="AUCTION">Enchère</option>
      </select>
      <select name="certified" defaultValue={defaults.certified ?? ""} aria-label="Certification vendeur">
        <option value="">Tous vendeurs</option>
        <option value="true">Certifiés</option>
      </select>
      <input name="maxPrice" inputMode="numeric" defaultValue={defaults.maxPrice} placeholder="Prix max" aria-label="Prix maximum" />
      <button className="button" type="submit">
        <Search size={17} aria-hidden="true" /> Filtrer
      </button>
    </form>
  );
}
