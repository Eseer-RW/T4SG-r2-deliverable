"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({ species }: { species: Species }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").delete().eq("id", species.id);

    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }

    setOpen(false);
    router.refresh();
    setIsDeleting(false);
    toast({
      title: "Species deleted",
      description: `${species.scientific_name} has been removed.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Species
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete species?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{species.scientific_name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
