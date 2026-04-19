import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Plus, LayoutGrid, BookOpen, Users, Folder, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DrilzzPicksSection } from "@/components/DrilzzPicksSection";
import { useCollections, Collection } from "@/hooks/useCollections";
import OnboardingDialog from "@/components/OnboardingDialog";
import { SportSelectionDialog } from "@/components/SportSelectionDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSportSelection, setShowSportSelection] = useState(false);
  const { loadOfficialCollections } = useCollections(user?.id || null);
  const [officialCollections, setOfficialCollections] = useState<Collection[]>([]);
  useEffect(() => {
    checkUser();

    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const checkUser = async () => {
    try {
      const {
        data: {
          user
        },
        error
      } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/login");
        return;
      }
      setUser(user);

      // Fetch profile data
      const {
        data: profileData,
        error: profileError
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileError) throw profileError;
      setProfile(profileData);

      // Load official collections for user's sport
      if (profileData?.sport) {
        const picks = await loadOfficialCollections(profileData.sport);
        setOfficialCollections(picks);
      }

      // Check if user needs sport selection (Google OAuth users)
      if (profileData && !profileData.sport) {
        setShowSportSelection(true);
      }
      // Check if user needs onboarding (only after sport is set)
      else if (profileData && !profileData.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        {/* Top Navigation Skeleton */}
        <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
            <div className="h-10 md:h-12 w-24 bg-muted rounded animate-pulse"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse"></div>
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse"></div>
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-4 py-12 pb-24 md:pb-12">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 bg-card border rounded-lg animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-muted mb-2 mx-auto"></div>
                <div className="h-4 w-16 bg-muted rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        <MobileBottomNav userId={undefined} profile={null} />
      </div>
    );
  }
  const handleSportSelected = async (sport: string) => {
    setShowSportSelection(false);
    // Update local profile state
    setProfile((prev: any) => ({ ...prev, sport }));
    // Load official collections for the new sport
    const picks = await loadOfficialCollections(sport);
    setOfficialCollections(picks);
    // Now show onboarding if not completed
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  };

  if (!profile) return null;
  return <div className="min-h-screen bg-background animate-fade-in">
      {/* Sport Selection Dialog (for Google OAuth users) */}
      <SportSelectionDialog 
        open={showSportSelection} 
        userId={user?.id || ""} 
        onComplete={handleSportSelected} 
      />
      
      {/* Onboarding Dialog */}
      <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} />

      {/* Top Navigation */}
      <AppNavigation userId={user?.id} profile={profile} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-2xl text-foreground">
            Hi, {profile.name.split(" ")[0]}
          </h1>
        </div>

        {/* Drilzz Picks Section */}
        {officialCollections.length > 0 && (
          <DrilzzPicksSection 
            collections={officialCollections} 
            title="Discover Drilzz Picks"
            subtitle="Hand-picked collections to inspire your coaching"
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          <Link to="/create">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Create</span>
            </Card>
          </Link>

          <Link to="/feed">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Feed</span>
            </Card>
          </Link>

          <Link to="/community">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Community</span>
            </Card>
          </Link>

          <Link to="/library">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Library</span>
            </Card>
          </Link>

          <Link to="/collections">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Folder className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Collections</span>
            </Card>
          </Link>

          <Link to="/referrals">
            <Card className="p-4 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Referrals</span>
            </Card>
          </Link>
        </div>
      </div>

    </div>;
};
export default Dashboard;