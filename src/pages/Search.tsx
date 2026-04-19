import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppNavigation } from "@/components/AppNavigation";
import { DrillCardExplore } from "@/components/DrillCardExplore";
import { DrillCardExploreSkeletonGrid } from "@/components/DrillCardSkeleton";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

const SPORTS = [
  "Field Hockey",
  "Football / Soccer", 
  "Basketball",
  "Volleyball",
  "Floorball",
  "Tennis",
  "Ice Hockey",
  "Rugby",
  "Handball",
  "General Conditioning / Fitness"
];

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


const Search = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [drills, setDrills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [filters, setFilters] = useState({
    sport: "all",
    category: "all",
    ageGroup: "all",
    difficulty: "all",
    sort: "relevant",
    minRating: "all"
  });

  useEffect(() => {
    checkUser();
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setPage(0);
      setHasMore(true);
      searchDrills(true);
    }
  }, [searchQuery, filters, user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
    setUserLoading(false);
  };

  const searchDrills = async (reset = false) => {
    if (!user) return;

    const currentPage = reset ? 0 : page;
    
    try {
      setLoading(true);

      const ITEMS_PER_PAGE = 20;

      // Use rating view for rating-based sorting or filtering
      const useRatingView = filters.sort === "highest-rated" || filters.minRating !== "all";

      let query;
      if (useRatingView) {
        query = supabase
          .from("drills_with_ratings" as any)
          .select(`
            *,
            profiles:user_id (name, club),
            likes (count)
          `)
          .eq("published", true);
      } else {
        query = supabase
          .from("drills")
          .select(`
            *,
            profiles:user_id (name, club),
            likes (count)
          `)
          .eq("published", true);
      }

      // Apply sport filter
      if (filters.sport !== "all") {
        query = query.eq("sport", filters.sport);
      }

      // Apply category filter
      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      // Apply age group filter
      if (filters.ageGroup !== "all") {
        query = query.eq("age_group", filters.ageGroup);
      }

      // Apply difficulty filter
      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      // Apply minimum rating filter
      if (filters.minRating !== "all") {
        query = query.gte("average_rating", parseFloat(filters.minRating));
      }

      // Apply text search
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,coaching_points.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      if (filters.sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sort === "popular") {
        query = query.order("likes", { ascending: false });
      } else if (filters.sort === "highest-rated") {
        query = query.order("average_rating", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      const newDrills = data || [];
      
      if (reset) {
        setDrills(newDrills);
      } else {
        setDrills(prev => [...prev, ...newDrills]);
      }

      setHasMore(newDrills.length === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
    } catch (error: any) {
      console.error("Error searching drills:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchDrills(false);
    }
  };

  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
    threshold: 300
  });

  const handleSearchSubmit = (query: string) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const updated = [query.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const resetFilters = () => {
    setFilters({
      sport: "all",
      category: "all",
      ageGroup: "all",
      difficulty: "all",
      sort: "relevant",
      minRating: "all"
    });
    setSearchQuery("");
  };

  const activeFilterCount = [
    filters.sport !== "all",
    filters.category !== "all",
    filters.ageGroup !== "all",
    filters.difficulty !== "all",
    filters.minRating !== "all",
    searchQuery.trim() !== ""
  ].filter(Boolean).length;

  if (!user || userLoading) return null;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <AppNavigation userId={user?.id} profile={profile} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search drills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                className="pl-10 pr-10 h-10 border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Recent Searches */}
              {showSuggestions && recentSearches.length > 0 && (
                <Card className="absolute top-full mt-2 w-full shadow-strong z-50 bg-popover">
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <History className="w-3 h-3" />
                        Recent
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors flex items-center gap-2"
                      >
                        <SearchIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Filter Button */}
            <SearchFiltersSheet
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
              onReset={resetFilters}
            />
          </div>
        </div>

        {/* Results */}
        {loading && drills.length === 0 ? (
          <DrillCardExploreSkeletonGrid count={12} />
        ) : !loading && drills.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg mb-2">No Drills Found</h3>
            <p className="text-sm text-muted-foreground">
              {activeFilterCount > 0 
                ? "Try adjusting your filters"
                : "Start searching to discover drills"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
              {drills.map((drill) => (
                <DrillCardExplore key={drill.id} drill={drill} />
              ))}
            </div>

            {/* Loading indicator */}
            {loading && drills.length > 0 && (
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
};

export default Search;
