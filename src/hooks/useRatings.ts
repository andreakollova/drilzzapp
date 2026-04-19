import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRatings = (drillId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get average rating for a drill
  const { data: averageRating, isLoading: loadingAverage } = useQuery({
    queryKey: ["drill-rating", drillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("drill_id", drillId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
      const average = sum / data.length;

      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal
        count: data.length,
      };
    },
  });

  // Get current user's rating
  const { data: userRating, isLoading: loadingUserRating } = useQuery({
    queryKey: ["user-rating", drillId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("drill_id", drillId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.rating || null;
    },
  });

  // Submit or update rating
  const rateDrill = useMutation({
    mutationFn: async (rating: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to rate");

      const { error } = await supabase
        .from("ratings")
        .upsert({
          user_id: user.id,
          drill_id: drillId,
          rating,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drill-rating", drillId] });
      queryClient.invalidateQueries({ queryKey: ["user-rating", drillId] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this drill!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
      console.error("Rating error:", error);
    },
  });

  return {
    averageRating: averageRating?.average || 0,
    ratingCount: averageRating?.count || 0,
    userRating,
    isLoading: loadingAverage || loadingUserRating,
    rateDrill: rateDrill.mutate,
  };
};
