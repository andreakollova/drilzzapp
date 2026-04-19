import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowStats {
  followers: number;
  following: number;
  isFollowing: boolean;
}

export const useFollowSystem = (profileUserId: string, currentUserId: string | null) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<FollowStats>({
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFollowStats();
  }, [profileUserId, currentUserId]);

  const loadFollowStats = async () => {
    try {
      // Get follower count
      const { count: followersCount, error: followersError } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileUserId);

      if (followersError) throw followersError;

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileUserId);

      if (followingError) throw followingError;

      // Check if current user follows this profile
      let isFollowing = false;
      if (currentUserId && currentUserId !== profileUserId) {
        const { data: followData, error: followError } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", profileUserId)
          .maybeSingle();

        if (followError) throw followError;
        isFollowing = !!followData;
      }

      setStats({
        followers: followersCount || 0,
        following: followingCount || 0,
        isFollowing,
      });
    } catch (error: any) {
      console.error("Error loading follow stats:", error);
      toast({
        title: "Error",
        description: "Failed to load follow stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow coaches",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === profileUserId) {
      toast({
        title: "Invalid Action",
        description: "You cannot follow yourself",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);

    try {
      if (stats.isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profileUserId);

        if (error) throw error;

        setStats((prev) => ({
          ...prev,
          followers: prev.followers - 1,
          isFollowing: false,
        }));

        toast({
          title: "Unfollowed",
          description: "You are no longer following this coach",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profileUserId,
          });

        if (error) throw error;

        setStats((prev) => ({
          ...prev,
          followers: prev.followers + 1,
          isFollowing: true,
        }));

        toast({
          title: "Following",
          description: "You are now following this coach",
        });
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return { stats, loading, actionLoading, toggleFollow };
};
