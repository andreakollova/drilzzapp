import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import { AppNavigation } from "@/components/AppNavigation";
import { DrillCardExplore } from "@/components/DrillCardExplore";
import { DrillCardExploreSkeletonGrid } from "@/components/DrillCardSkeleton";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const SPORT_CATEGORIES: Record<string, string[]> = {
  "Field Hockey": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Football / Soccer": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Possession", "Tactics", "Warm-up", "Conditioning"],
  "Basketball": ["Dribbling", "Shooting", "Passing", "Defense", "Rebounding", "Fast Break", "Tactics", "Warm-up", "Conditioning"],
  "Volleyball": ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Tactics", "Warm-up", "Conditioning"],
  "Floorball": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Tennis": ["Forehand", "Backhand", "Serving", "Volley", "Footwork", "Tactics", "Warm-up", "Conditioning"],
  "Ice Hockey": ["Skating", "Puck Control", "Passing", "Shooting", "Defense", "Goalkeeping", "Tactics", "Warm-up", "Conditioning"],
  "Rugby": ["Passing", "Tackling", "Rucking", "Mauling", "Lineout", "Scrum", "Tactics", "Warm-up", "Conditioning"],
  "Handball": ["Dribbling", "Passing", "Shooting", "Defense", "Goalkeeping", "Fast Break", "Tactics", "Warm-up", "Conditioning"],
  "General Conditioning / Fitness": ["Strength", "Cardio", "Agility", "Speed", "Endurance", "Flexibility", "Core", "HIIT", "Recovery"]
};

const AGE_GROUPS = ["U6", "U8", "U10", "U12", "U14", "U16", "U18", "U21", "Adult", "Senior", "All Ages"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

export default function Community() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [filters, setFilters] = useState({
    sport: "all",
    category: "all",
    ageGroup: "all",
    difficulty: "all",
    sort: "newest",
    minRating: "all"
  });

  useEffect(() => {
    setDrills([]);
    setPage(0);
    setHasMore(true);
    loadData(true);
  }, [navigate, filters]);

  const loadData = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const ITEMS_PER_PAGE = 20;

      // Build query for drills - use view for rating-based sorting
      const useRatingView = filters.sort === "highest-rated" || filters.minRating !== "all";
      let query;

      if (useRatingView) {
        query = supabase
          .from("drills_with_ratings" as any)
          .select(`
            *,
            profiles:user_id (name, club)
          `)
          .eq("sport", profileData.sport)
          .eq("published", true);
      } else {
        query = supabase
          .from("drills")
          .select(`
            *,
            profiles:user_id (name, club)
          `)
          .eq("sport", profileData.sport)
          .eq("published", true);
      }

      // Apply filters
      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.ageGroup !== "all") {
        query = query.eq("age_group", filters.ageGroup);
      }
      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }
      if (filters.minRating !== "all") {
        query = query.gte("average_rating", parseFloat(filters.minRating));
      }

      // Apply sorting
      if (filters.sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sort === "popular") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sort === "highest-rated") {
        query = query.order("average_rating", { ascending: false });
      }

      // Apply pagination
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: drillsData, error } = await query;

      if (error) throw error;

      const newDrills = drillsData || [];
      
      if (reset) {
        setDrills(newDrills);
      } else {
        setDrills(prev => [...prev, ...newDrills]);
      }
      
      setHasMore(newDrills.length === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
      setUserLoading(false);
    } catch (error: any) {
      console.error("Error loading drills:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadData(false);
    }
  };

  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
    threshold: 300
  });

  const resetFilters = () => {
    setFilters({
      sport: "all",
      category: "all",
      ageGroup: "all",
      difficulty: "all",
      sort: "newest",
      minRating: "all"
    });
  };

  const activeFilterCount = [
    filters.category !== "all",
    filters.ageGroup !== "all",
    filters.difficulty !== "all",
    filters.minRating !== "all"
  ].filter(Boolean).length;

  if (userLoading || loading || !profile) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <AppNavigation userId={user?.id} profile={profile} />
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-12">
          <div className="mb-4">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
          </div>
          <DrillCardExploreSkeletonGrid count={12} />
        </div>
        <MobileBottomNav userId={user?.id} profile={profile} />
      </div>
    );
  }

  const categories = SPORT_CATEGORIES[profile.sport] || [];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <AppNavigation userId={user?.id} profile={profile} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-12">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl sm:text-3xl">Community</h1>
            <Badge variant="secondary" className="text-xs">
              {profile.sport}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {drills.length} {drills.length === 1 ? "drill" : "drills"}
          </p>
        </div>

        {/* Category Pills + Filter Button */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={filters.category === "all" ? "default" : "outline"}
            onClick={() => setFilters({ ...filters, category: "all" })}
            className="rounded-full flex-shrink-0 h-8 text-xs px-4"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filters.category === cat ? "default" : "outline"}
              onClick={() => setFilters({ ...filters, category: cat })}
              className="rounded-full flex-shrink-0 h-8 text-xs px-4"
            >
              {cat}
            </Button>
          ))}
          <SearchFiltersSheet
            filters={filters}
            onFiltersChange={setFilters}
            activeFilterCount={activeFilterCount}
            onReset={resetFilters}
          />
        </div>

        {/* Drills Grid */}
        {drills.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg mb-2">No drills found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeFilterCount > 0
                ? "Try adjusting your filters"
                : "Be the first to share a drill"}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
              {drills.map((drill) => (
                <DrillCardExplore key={drill.id} drill={drill} />
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
            {!hasMore && drills.length > 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No more drills to load
              </div>
            )}
          </>
        )}
      </div>
      <MobileBottomNav userId={user?.id} profile={profile} />
    </div>
  );
}
