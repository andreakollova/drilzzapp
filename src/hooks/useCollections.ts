import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  drill_count?: number;
  is_official?: boolean;
  sport?: string;
  display_order?: number;
  icon?: string;
}

export const useCollections = (userId: string | null) => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCollections();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadCollections = async () => {
    if (!userId) return;

    try {
      // Fetch collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (collectionsError) throw collectionsError;

      // Get drill count for each collection
      if (collectionsData && collectionsData.length > 0) {
        const collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            const { count } = await supabase
              .from("drill_collections")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);

            return {
              ...collection,
              drill_count: count || 0,
            };
          })
        );
        setCollections(collectionsWithCounts);
      } else {
        setCollections([]);
      }
    } catch (error: any) {
      console.error("Error loading collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (name: string, description: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Collection Created",
        description: `"${name}" has been created`,
      });

      await loadCollections();
      return data;
    } catch (error: any) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCollection = async (
    collectionId: string,
    name: string,
    description: string
  ) => {
    try {
      const { error } = await supabase
        .from("collections")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", collectionId);

      if (error) throw error;

      toast({
        title: "Collection Updated",
        description: "Your changes have been saved",
      });

      await loadCollections();
      return true;
    } catch (error: any) {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;

      toast({
        title: "Collection Deleted",
        description: "The collection has been removed",
      });

      await loadCollections();
      return true;
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const addDrillToCollection = async (collectionId: string, drillId: string) => {
    try {
      // Get the current max position in the collection
      const { data: existingDrills } = await supabase
        .from("drill_collections")
        .select("position")
        .eq("collection_id", collectionId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existingDrills && existingDrills.length > 0 
        ? (existingDrills[0].position || 0) + 1 
        : 1;

      const { error } = await supabase
        .from("drill_collections")
        .insert({
          collection_id: collectionId,
          drill_id: drillId,
          position: nextPosition,
        });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - drill already in collection
          toast({
            title: "Already Added",
            description: "This drill is already in the collection",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to Collection",
        description: "Drill has been added to the collection",
      });

      await loadCollections();
      return true;
    } catch (error: any) {
      console.error("Error adding drill to collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add drill to collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDrillFromCollection = async (
    collectionId: string,
    drillId: string
  ) => {
    try {
      const { error } = await supabase
        .from("drill_collections")
        .delete()
        .eq("collection_id", collectionId)
        .eq("drill_id", drillId);

      if (error) throw error;

      toast({
        title: "Removed from Collection",
        description: "Drill has been removed from the collection",
      });

      await loadCollections();
      return true;
    } catch (error: any) {
      console.error("Error removing drill from collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove drill from collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderDrills = async (
    collectionId: string,
    drillIds: string[]
  ) => {
    try {
      // Update positions for all drills in the collection
      const updates = drillIds.map((drillId, index) => 
        supabase
          .from("drill_collections")
          .update({ position: index + 1 })
          .eq("collection_id", collectionId)
          .eq("drill_id", drillId)
      );

      await Promise.all(updates);

      return true;
    } catch (error: any) {
      console.error("Error reordering drills:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder drills",
        variant: "destructive",
      });
      return false;
    }
  };

  const loadOfficialCollections = async (userSport?: string) => {
    try {
      let query = supabase
        .from("collections")
        .select("*")
        .eq("is_official", true)
        .order("display_order", { ascending: true });

      // Filter by sport if provided, or include collections without sport (universal)
      if (userSport) {
        query = query.or(`sport.eq.${userSport},sport.is.null`);
      }

      const { data: collectionsData, error: collectionsError } = await query;

      if (collectionsError) throw collectionsError;

      // Get drill count for each collection
      if (collectionsData && collectionsData.length > 0) {
        const collectionsWithCounts = await Promise.all(
          collectionsData.map(async (collection) => {
            const { count } = await supabase
              .from("drill_collections")
              .select("*", { count: "exact", head: true })
              .eq("collection_id", collection.id);

            return {
              ...collection,
              drill_count: count || 0,
            };
          })
        );
        return collectionsWithCounts;
      }
      return [];
    } catch (error: any) {
      console.error("Error loading official collections:", error);
      return [];
    }
  };

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    addDrillToCollection,
    removeDrillFromCollection,
    reorderDrills,
    refresh: loadCollections,
    loadOfficialCollections,
  };
};
