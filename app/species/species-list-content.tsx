"use client";

import { Input } from "@/components/ui/input";
import type { SpeciesWithAuthor } from "@/lib/schema";
import { useState } from "react";
import SpeciesCard from "./species-card";

function matchesSearch(species: SpeciesWithAuthor, search: string): boolean {
  if (!search.trim()) return true;
  const lower = search.trim().toLowerCase();
  const scientific = (species.scientific_name ?? "").toLowerCase();
  const common = (species.common_name ?? "").toLowerCase();
  const description = (species.description ?? "").toLowerCase();
  return (
    scientific.includes(lower) ||
    common.includes(lower) ||
    description.includes(lower)
  );
}

export default function SpeciesListContent({
  species,
  sessionId,
}: {
  species: SpeciesWithAuthor[];
  sessionId: string;
}) {
  const [search, setSearch] = useState("");

  const filteredSpecies = species.filter((s) => matchesSearch(s, search));

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by scientific name, common name, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="flex flex-wrap justify-center">
        {filteredSpecies.map((s) => (
          <SpeciesCard key={s.id} species={s} sessionId={sessionId} />
        ))}
      </div>
      {filteredSpecies.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No species match your search.
        </p>
      )}
    </>
  );
}
