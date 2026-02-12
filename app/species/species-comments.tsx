"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Comment = Database["public"]["Tables"]["species_comments"]["Row"] & {
  profiles: { display_name: string; email: string } | null;
};

export default function SpeciesComments({
  speciesId,
  sessionId,
}: {
  speciesId: number;
  sessionId: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("species_comments")
      .select("*, profiles!species_comments_author_fkey(display_name, email)")
      .eq("species_id", speciesId)
      .order("created_at", { ascending: false });
    setComments((data as Comment[]) ?? []);
  };

  useEffect(() => {
    void fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchComments is stable, speciesId is the only dep
  }, [speciesId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || isSubmitting) return;
    void submitComment(trimmed);
  };

  const submitComment = async (content: string) => {
    setIsSubmitting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species_comments")
      .insert({ species_id: speciesId, author: sessionId, content });
    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewComment("");
      void fetchComments();
      router.refresh();
      toast({ title: "Comment added." });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: number) => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    router.refresh();
    toast({ title: "Comment deleted." });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Comments</h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
          Post
        </Button>
      </form>
      <div className="space-y-2">
        {comments.map((comment) => {
          const authorDisplay =
            comment.profiles?.display_name ?? comment.profiles?.email ?? "Unknown";
          const isAuthor = comment.author === sessionId;

          return (
            <div
              key={comment.id}
              className="flex items-start justify-between gap-2 rounded border bg-muted/30 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{authorDisplay}</p>
                <p className="mt-1 text-sm">{comment.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    void handleDelete(comment.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
