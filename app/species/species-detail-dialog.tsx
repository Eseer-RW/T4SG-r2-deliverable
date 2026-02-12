"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { SpeciesWithAuthor } from "@/lib/schema";
import SpeciesComments from "./species-comments";

export default function SpeciesDetailDialog({
  species,
  sessionId,
}: {
  species: SpeciesWithAuthor;
  sessionId: string;
}) {
  const authorDisplay =
    species.profiles?.display_name ?? species.profiles?.email ?? "Unknown";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Learn More</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>View detailed information about this species.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Common Name</h4>
            <p>{species.common_name ?? "—"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Kingdom</h4>
            <p>{species.kingdom}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Total Population</h4>
            <p>{species.total_population?.toLocaleString() ?? "Unknown"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Endangered</h4>
            <p>{species.endangered ? "Yes" : "No"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
            <p className="whitespace-pre-wrap">{species.description ?? "No description available."}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Added by</h4>
            <p>{authorDisplay}</p>
          </div>
          <Separator className="my-2" />
          <SpeciesComments speciesId={species.id} sessionId={sessionId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
