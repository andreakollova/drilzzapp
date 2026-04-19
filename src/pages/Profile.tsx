import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Trophy, Target, UserPlus, UserMinus, Settings, Plus } from "lucide-react";
import drilzzLogo from "@/assets/logo-black.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFollowSystem } from "@/hooks/useFollowSystem";
import { DrillCardProfile, DrillCardProfileSkeleton } from "@/components/DrillCardProfile";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [drills, setDrills] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDrills: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const { stats: followStats, loading: followLoading, actionLoading, toggleFollow } = useFollowSystem(
    id || "",
    currentUserId
  );

  useEffect(() => {
    loadProfile();
  }, [id, navigate]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }
      
      setCurrentUserId(user.id);

      // Fetch current user's profile for nav
      const { data: currentUserData } = await supabase
        .from("profiles")
        .select("avatar_url, name")
        .eq("id", user.id)
        .single();
      setCurrentUserProfile(currentUserData);

      // Load profile - use public_profiles view for other users to protect email privacy
      const isOwnProfile = user.id === id;
      
      const { data: profileData, error: profileError } = isOwnProfile
        ? await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single()
        : await supabase
            .from("public_profiles")
            .select("*")
            .eq("id", id)
            .single();

      if (profileError || !profileData) {
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive"
        });
        navigate("/community");
        return;
      }

      setProfile(profileData);

      // Load user's published drills
      const { data: drillsData, error: drillsError } = await supabase
        .from("drills")
        .select(`
          *,
          likes (count)
        `)
        .eq("user_id", id)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (drillsError) throw drillsError;

      setDrills(drillsData || []);

      // Calculate stats
      const totalDrills = drillsData?.length || 0;
      const totalLikes = drillsData?.reduce((sum, drill) => {
        return sum + (drill.likes?.[0]?.count || 0);
      }, 0) || 0;

      setStats({ totalDrills, totalLikes });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background animate-fade-in">
        {/* Navigation */}
        <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-10">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="h-12 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Header Skeleton */}
          <div className="mb-8">
            <div className="flex gap-6 mb-6">
              {/* Avatar Skeleton */}
              <div className="w-20 h-20 rounded-full bg-muted animate-pulse shrink-0"></div>

              {/* Stats Skeleton */}
              <div className="flex-1 flex items-center gap-6 md:gap-8">
                <div className="text-center">
                  <div className="h-6 w-12 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-10 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-12 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-12 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Name and Info Skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
              </div>
              <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
            </div>
          </div>

          {/* Drills Grid Skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <DrillCardProfileSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background animate-fade-in">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <img src={drilzzLogo} alt="Drilzz" className="h-12" />
          </Link>
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-24 md:pb-12">
        {/* Profile Header - Instagram Style */}
        <div className="mb-8">
          <div className="flex gap-6 mb-6">
            {/* Avatar */}
            <Avatar className="w-20 h-20 shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            {/* Stats Row */}
            <div className="flex-1 flex items-center gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-xl font-bold font-display">{stats.totalDrills}</p>
                <p className="text-sm text-muted-foreground">drills</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-display">
                  {followLoading ? "..." : followStats.followers}
                </p>
                <p className="text-sm text-muted-foreground">followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold font-display">
                  {followLoading ? "..." : followStats.following}
                </p>
                <p className="text-sm text-muted-foreground">following</p>
              </div>
            </div>
          </div>

          {/* Name and Info */}
          <div className="space-y-3">
            <h1 className="font-display text-xl font-semibold">{profile.name}</h1>
            
            {/* Sport and Club Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {profile.sport}
              </Badge>
              {profile.club && (
                <Badge variant="outline" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  {profile.club}
                </Badge>
              )}
              {profile.country && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {profile.country}
                </Badge>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {currentUserId && currentUserId !== id ? (
                <Button
                  onClick={toggleFollow}
                  disabled={actionLoading || followLoading}
                  variant={followStats.isFollowing ? "outline" : "default"}
                  size="sm"
                >
                  {actionLoading ? (
                    "..."
                  ) : followStats.isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Drills Section */}
        <div className="space-y-4">
          <h2 className="font-display text-base font-semibold text-muted-foreground uppercase tracking-wide">
            Created Drills
          </h2>

          {drills.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg mb-2">No drills yet</h3>
              <p className="text-sm text-muted-foreground">
                {currentUserId === id 
                  ? "Create your first drill to get started"
                  : "This coach hasn't published any drills yet"}
              </p>
              {currentUserId === id && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate("/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Drill
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              {drills.map((drill) => (
                <DrillCardProfile key={drill.id} drill={drill} />
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileBottomNav userId={currentUserId || undefined} profile={currentUserProfile} />
    </div>
  );
};

export default Profile;
