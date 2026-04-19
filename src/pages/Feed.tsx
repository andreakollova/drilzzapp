import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DrillCardExplore } from "@/components/DrillCardExplore";
import { DrillCardExploreSkeletonGrid } from "@/components/DrillCardSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

interface FeedItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  sport: string;
  category: string;
  difficulty: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_club: string | null;
  activity_type: string;
  profiles?: {
    name: string;
    club?: string;
  };
}

export default function Feed() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadFeed(true);
  }, []);

  const loadFeed = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    try {
      // Get current user
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Get following count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);
      setFollowingCount(count || 0);

      const ITEMS_PER_PAGE = 20;

      // Get feed from followed coaches with pagination
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: feedData, error } = await supabase
        .from("following_activity")
        .select("*")
        .eq("follower_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to match DrillCardExplore expectations
      const transformedFeed = (feedData || []).map((item) => ({
        ...item,
        profiles: {
          name: item.author_name,
          club: item.author_club
        }
      }));

      if (reset) {
        setFeed(transformedFeed);
      } else {
        setFeed(prev => [...prev, ...transformedFeed]);
      }

      setHasMore(transformedFeed.length === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
      setUserLoading(false);
    } catch (error: any) {
      console.error("Error loading feed:", error);
      toast({
        title: "Error",
        description: "Failed to load your feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadFeed(false);
    }
  };

  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
    threshold: 300
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <AppNavigation userId={userId || undefined} profile={profile} />
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-12">
          <div className="mb-4">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
          </div>
          <DrillCardExploreSkeletonGrid count={12} />
        </div>
        <MobileBottomNav userId={userId || undefined} profile={profile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <AppNavigation userId={userId || undefined} profile={profile} />

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-12">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl">Your Feed</h1>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {followingCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Activity from coaches you follow
          </p>
        </div>

        {/* Empty State */}
        {feed.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg mb-2">Your feed is empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Start following coaches to see their latest drills
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="sm" onClick={() => navigate("/community")}>
                Explore Community
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/search")}>
                Search Drills
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Feed Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
              {feed.map((item) => (
                <DrillCardExplore key={item.id} drill={item} />
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Intersection observer target */}
            <div ref={loadMoreRef} className="h-4" />

            {/* End of results */}
            {!hasMore && feed.length > 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No more activity to load
              </div>
            )}
          </>
        )}
      </div>
      <MobileBottomNav userId={userId || undefined} profile={profile} />
    </div>
  );
}
