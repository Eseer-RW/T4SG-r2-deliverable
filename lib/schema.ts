export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Species with joined author profile (from select with profiles!species_author_fkey) */
export type SpeciesWithAuthor = Database["public"]["Tables"]["species"]["Row"] & {
  profiles: { display_name: string; email: string } | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          biography: string | null;
          display_name: string;
          email: string;
          id: string;
        };
        Insert: {
          biography?: string | null;
          display_name: string;
          email: string;
          id: string;
        };
        Update: {
          biography?: string | null;
          display_name?: string;
          email?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      species: {
        Row: {
          author: string;
          common_name: string | null;
          description: string | null;
          endangered: boolean;
          id: number;
          image: string | null;
          kingdom: Database["public"]["Enums"]["kingdom"];
          scientific_name: string;
          total_population: number | null;
        };
        Insert: {
          author: string;
          common_name?: string | null;
          description?: string | null;
          endangered?: boolean;
          id?: number;
          image?: string | null;
          kingdom: Database["public"]["Enums"]["kingdom"];
          scientific_name: string;
          total_population?: number | null;
        };
        Update: {
          author?: string;
          common_name?: string | null;
          description?: string | null;
          endangered?: boolean;
          id?: number;
          image?: string | null;
          kingdom?: Database["public"]["Enums"]["kingdom"];
          scientific_name?: string;
          total_population?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "species_author_fkey";
            columns: ["author"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      species_comments: {
        Row: {
          id: number;
          species_id: number;
          author: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          species_id: number;
          author: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          species_id?: number;
          author?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "species_comments_species_id_fkey";
            columns: ["species_id"];
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "species_comments_author_fkey";
            columns: ["author"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      kingdom: "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
