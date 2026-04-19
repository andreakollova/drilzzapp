import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, ClipboardList, X, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { DrillCardLibrary } from "@/components/DrillCardLibrary";
import { SessionCardLibrary } from "@/components/SessionCardLibrary";
import { DrillCardSelectable } from "@/components/DrillCardSelectable";
import { SessionCardSelectable } from "@/components/SessionCardSelectable";
import { BatchExportToolbar } from "@/components/BatchExportToolbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DrillCardProfileSkeleton } from "@/components/DrillCardProfile";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { generateBatchDrillsPDF, generateBatchSessionsPDF } from "@/lib/pdf-utils";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

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
export default function Library() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [drills, setDrills] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drillToDelete, setDrillToDelete] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [hasMoreDrills, setHasMoreDrills] = useState(true);
  const [drillsPage, setDrillsPage] = useState(0);
  const [filters, setFilters] = useState({
    category: "all",
    ageGroup: "all",
    difficulty: "all"
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDrillIds, setSelectedDrillIds] = useState<Set<string>>(new Set());
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    setDrills([]);
    setDrillsPage(0);
    setHasMoreDrills(true);
    loadDrills(true);
  }, [navigate, filters]);
  const loadDrills = async (reset = false) => {
    const currentPage = reset ? 0 : drillsPage;
    
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      // Get profile
      const {
        data: profileData
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      const ITEMS_PER_PAGE = 20;

      // Load user's drills with profile data and filters
      let query = supabase.from("drills").select(`
          *,
          profiles:user_id (name, club),
          likes (count)
        `).eq("user_id", user.id);

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

      query = query.order("created_at", { ascending: false });

      // Apply pagination
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: drillsData, error: drillsError } = await query;
      if (drillsError) throw drillsError;

      const newDrills = drillsData || [];
      
      if (reset) {
        setDrills(newDrills);
      } else {
        setDrills(prev => [...prev, ...newDrills]);
      }

      setHasMoreDrills(newDrills.length === ITEMS_PER_PAGE);
      setDrillsPage(currentPage + 1);

      // Load user's training sessions (no pagination needed for sessions)
      if (reset) {
        const {
          data: sessionsData,
          error: sessionsError
        } = await supabase.from("training_sessions").select(`
            *,
            session_drills (count)
          `).eq("user_id", user.id).order("created_at", {
          ascending: false
        });
        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);
      }
      
      setUserLoading(false);
    } catch (error: any) {
      console.error("Error loading drills:", error);
      toast({
        title: "Error",
        description: "Failed to load drills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDrills = () => {
    if (!loading && hasMoreDrills) {
      loadDrills(false);
    }
  };

  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore: hasMoreDrills,
    onLoadMore: loadMoreDrills,
    threshold: 300
  });
  const handleDelete = async () => {
    if (!drillToDelete) return;
    try {
      const drillToRemove = drills.find(d => d.id === drillToDelete);

      // Delete image from storage if it exists and isn't the placeholder
      if (drillToRemove?.image_url && drillToRemove.image_url !== "/placeholder.svg" && drillToRemove.image_url.includes('drill-images')) {
        const imagePath = drillToRemove.image_url.split('/drill-images/')[1];
        if (imagePath) {
          await supabase.storage.from('drill-images').remove([imagePath]);
        }
      }

      // Delete the drill (cascading deletes will handle likes, comments, saved_drills)
      const {
        error
      } = await supabase.from("drills").delete().eq("id", drillToDelete).eq("user_id", user.id);
      if (error) throw error;
      toast({
        title: "Drill Deleted",
        description: "The drill has been removed from your library"
      });

      // Refresh the drills list
      setDrills(drills.filter(d => d.id !== drillToDelete));
      setDrillToDelete(null);
    } catch (error: any) {
      console.error("Error deleting drill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionToDelete)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Session Deleted",
        description: "The training session has been removed"
      });

      setSessions(sessions.filter(s => s.id !== sessionToDelete));
      setSessionToDelete(null);
    } catch (error: any) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      category: "all",
      ageGroup: "all",
      difficulty: "all"
    });
  };

  const activeFilterCount = [
    filters.category !== "all",
    filters.ageGroup !== "all",
    filters.difficulty !== "all"
  ].filter(Boolean).length;

  const categories = profile ? SPORT_CATEGORIES[profile.sport] || [] : [];

  const toggleDrillSelection = (drillId: string) => {
    setSelectedDrillIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(drillId)) {
        newSet.delete(drillId);
      } else {
        newSet.add(drillId);
      }
      return newSet;
    });
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const selectAllDrills = () => {
    setSelectedDrillIds(new Set(drills.map((d) => d.id)));
  };

  const selectAllSessions = () => {
    setSelectedSessionIds(new Set(sessions.map((s) => s.id)));
  };

  const clearSelection = () => {
    setSelectedDrillIds(new Set());
    setSelectedSessionIds(new Set());
    setSelectionMode(false);
  };

  const handleBatchExport = async () => {
    setIsExporting(true);
    try {
      if (selectedDrillIds.size > 0) {
        const selectedDrills = drills.filter((d) => selectedDrillIds.has(d.id));
        await generateBatchDrillsPDF(selectedDrills);
        toast({
          title: "Export Complete",
          description: `${selectedDrills.length} drill${selectedDrills.length !== 1 ? "s" : ""} exported to PDF`,
        });
      } else if (selectedSessionIds.size > 0) {
        const selectedSessions = sessions.filter((s) => selectedSessionIds.has(s.id));
        await generateBatchSessionsPDF(selectedSessions);
        toast({
          title: "Export Complete",
          description: `${selectedSessions.length} session${selectedSessions.length !== 1 ? "s" : ""} exported to PDF`,
        });
      }
      clearSelection();
    } catch (error) {
      console.error("Batch export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalSelected = selectedDrillIds.size + selectedSessionIds.size;

  if (userLoading || loading) {
    return <div className="min-h-screen bg-background animate-fade-in">
        <AppNavigation userId={user?.id} profile={profile} />
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          <div className="mb-6">
            <div className="h-8 bg-muted rounded w-32 animate-pulse mb-6"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <DrillCardProfileSkeleton key={i} />
            ))}
          </div>
        </div>
        <MobileBottomNav userId={user?.id} profile={profile} />
      </div>;
  }
  return <div className="min-h-screen bg-background animate-fade-in">
      <AppNavigation userId={user?.id} profile={profile} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl">
            My Library
          </h1>
          <div className="flex items-center gap-2">
            {!selectionMode && (drills.length > 0 || sessions.length > 0) && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectionMode(true)}
                className="h-8 w-8"
              >
                <CheckSquare className="w-4 h-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gradient-hero">
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/create" className="w-full cursor-pointer">
                    New Drill
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/sessions/create" className="w-full cursor-pointer">
                    New Session
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="drills" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="drills">Drills ({drills.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drills">
            {/* Filter Pills */}
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
                filters={{ ...filters, sport: "all", sort: "newest", minRating: "all" }}
                onFiltersChange={(newFilters) => setFilters({
                  category: newFilters.category,
                  ageGroup: newFilters.ageGroup,
                  difficulty: newFilters.difficulty
                })}
                activeFilterCount={activeFilterCount}
                onReset={resetFilters}
              />
            </div>

            {drills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {activeFilterCount > 0 ? "No drills match your filters" : "No drills yet"}
                </p>
                {activeFilterCount > 0 ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                ) : (
                  <Link to="/create">
                    <Button size="sm" className="gradient-hero">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Drill
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {drills.map(drill =>
                    selectionMode ? (
                      <DrillCardSelectable
                        key={drill.id}
                        drill={drill}
                        isSelected={selectedDrillIds.has(drill.id)}
                        onToggleSelect={toggleDrillSelection}
                        onEdit={id => navigate(`/drill/${id}/edit`)}
                        onDelete={id => setDrillToDelete(id)}
                      />
                    ) : (
                      <DrillCardLibrary
                        key={drill.id}
                        drill={drill}
                        onEdit={id => navigate(`/drill/${id}/edit`)}
                        onDelete={id => setDrillToDelete(id)}
                      />
                    )
                  )}
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
                {!hasMoreDrills && drills.length > 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No more drills to load
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No training sessions yet</p>
                <Link to="/sessions/create">
                  <Button size="sm" className="gradient-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(session =>
                  selectionMode ? (
                    <SessionCardSelectable
                      key={session.id}
                      session={session}
                      isSelected={selectedSessionIds.has(session.id)}
                      onToggleSelect={toggleSessionSelection}
                      onEdit={id => navigate(`/sessions/${id}/edit`)}
                      onDelete={id => setSessionToDelete(id)}
                    />
                  ) : (
                    <SessionCardLibrary
                      key={session.id}
                      session={session}
                      onEdit={id => navigate(`/sessions/${id}/edit`)}
                      onDelete={id => setSessionToDelete(id)}
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Batch Export Toolbar */}
        {selectionMode && totalSelected > 0 && (
          <BatchExportToolbar
            selectedCount={totalSelected}
            onExport={handleBatchExport}
            onCancel={clearSelection}
            isExporting={isExporting}
          />
        )}

        {/* Delete Drill Confirmation Dialog */}
        <AlertDialog open={!!drillToDelete} onOpenChange={open => !open && setDrillToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Drill</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this drill? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Session Confirmation Dialog */}
        <AlertDialog open={!!sessionToDelete} onOpenChange={open => !open && setSessionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this training session? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <MobileBottomNav userId={user?.id} profile={profile} />
    </div>;
}