import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import drilzzLogo from "@/assets/logo-black.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Users, 
  FileText, 
  Activity, 
  Shield, 
  Trash2,
  Search,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  Bookmark,
  Star,
  UserPlus,
  Calendar
} from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminStatsSkeleton, AdminTableSkeleton } from "@/components/AdminLoadingSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminFiltersComponent, AdminFilters } from "@/components/AdminFilters";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { AdminDigestTrigger } from "@/components/AdminDigestTrigger";
import { RoleManagement } from "@/components/RoleManagement";
import { OfficialCollectionManager } from "@/components/OfficialCollectionManager";
import { AdminCommentsTable } from "@/components/AdminCommentsTable";
import { AdminSessionsTable } from "@/components/AdminSessionsTable";
import { AdminReferralsOverview } from "@/components/AdminReferralsOverview";
import { AdminAnalyticsDashboard } from "@/components/AdminAnalyticsDashboard";
import { isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrills: 0,
    totalComments: 0,
    totalLikes: 0,
    totalSessions: 0,
    totalFollows: 0,
    totalRatings: 0,
    totalSavedDrills: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [drills, setDrills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDrill, setDeletingDrill] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [userFilters, setUserFilters] = useState<AdminFilters>({});
  const [drillFilters, setDrillFilters] = useState<AdminFilters>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, adminLoading, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const [
        usersCount, 
        drillsCount, 
        commentsCount, 
        likesCount,
        sessionsCount,
        followsCount,
        ratingsCount,
        savedDrillsCount
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("drills").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("likes").select("*", { count: "exact", head: true }),
        supabase.from("training_sessions").select("*", { count: "exact", head: true }),
        supabase.from("follows").select("*", { count: "exact", head: true }),
        supabase.from("ratings").select("*", { count: "exact", head: true }),
        supabase.from("saved_drills").select("*", { count: "exact", head: true }),
      ]);

      // Check for errors in any of the count queries
      if (usersCount.error) throw usersCount.error;
      if (drillsCount.error) throw drillsCount.error;
      if (commentsCount.error) throw commentsCount.error;
      if (likesCount.error) throw likesCount.error;
      if (sessionsCount.error) throw sessionsCount.error;
      if (followsCount.error) throw followsCount.error;
      if (ratingsCount.error) throw ratingsCount.error;
      if (savedDrillsCount.error) throw savedDrillsCount.error;

      setStats({
        totalUsers: usersCount.count || 0,
        totalDrills: drillsCount.count || 0,
        totalComments: commentsCount.count || 0,
        totalLikes: likesCount.count || 0,
        totalSessions: sessionsCount.count || 0,
        totalFollows: followsCount.count || 0,
        totalRatings: ratingsCount.count || 0,
        totalSavedDrills: savedDrillsCount.count || 0,
      });

      // Load users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load all drills with author info
      const { data: drillsData, error: drillsError } = await supabase
        .from("drills")
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (drillsError) throw drillsError;
      setDrills(drillsData || []);
    } catch (error: any) {
      console.error("Error loading admin data:", error);
      setError(error.message || "Failed to load admin data");
      toast({
        title: "Error",
        description: error.message || "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrill = async (drillId: string) => {
    if (!confirm("Are you sure you want to delete this drill? This action cannot be undone.")) return;

    try {
      setDeletingDrill(drillId);
      const { error } = await supabase
        .from("drills")
        .delete()
        .eq("id", drillId);

      if (error) throw error;

      toast({ title: "Drill deleted successfully" });
      
      // Remove drill from local state for immediate UI update
      setDrills(drills.filter(d => d.id !== drillId));
    } catch (error: any) {
      console.error("Error deleting drill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive"
      });
    } finally {
      setDeletingDrill(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      
      // First, delete existing roles
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert the new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole as any }]);

      if (insertError) throw insertError;

      toast({ title: "User role updated successfully" });
      
      // Update local state for immediate UI update
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, user_roles: [{ role: newRole }] }
          : u
      ));
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const applyFilters = (items: any[], filters: AdminFilters, type: "users" | "drills") => {
    return items.filter(item => {
      // Date range filter
      if (filters.dateFrom) {
        const itemDate = new Date(item.created_at);
        if (isBefore(itemDate, startOfDay(filters.dateFrom))) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const itemDate = new Date(item.created_at);
        if (isAfter(itemDate, endOfDay(filters.dateTo))) {
          return false;
        }
      }

      // Sport filter
      if (filters.sport && item.sport !== filters.sport) {
        return false;
      }

      // Type-specific filters
      if (type === "users") {
        // Role filter
        if (filters.role) {
          const userRole = item.user_roles?.[0]?.role || "user";
          if (userRole !== filters.role) {
            return false;
          }
        }
      } else if (type === "drills") {
        // Status filter
        if (filters.status) {
          const isPublished = item.published;
          if (filters.status === "published" && !isPublished) {
            return false;
          }
          if (filters.status === "draft" && isPublished) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filteredUsers = applyFilters(
    users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    userFilters,
    "users"
  );

  const filteredDrills = applyFilters(
    drills.filter(drill =>
      drill.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    drillFilters,
    "drills"
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background">
        {/* Mobile-Optimized Header */}
        <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-4">
            {/* First Line: Logo and Menu */}
            <div className="h-16 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center">
                <img src={drilzzLogo} alt="Drilzz" className="h-10" />
              </Link>
              
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">Admin Panel</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => loadAdminData()}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>

              {/* Mobile Menu Trigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background z-50">
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="flex items-center gap-2 pb-4 border-b">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-medium">Admin Panel</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        loadAdminData();
                        setMobileMenuOpen(false);
                      }}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadAdminData()}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid - Mobile Optimized */}
          {loading ? (
            <AdminStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Users</p>
                    <Users className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalUsers}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Drills</p>
                    <FileText className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalDrills}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Sessions</p>
                    <Calendar className="w-5 h-5 md:w-8 md:h-8 text-secondary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalSessions}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Comments</p>
                    <Activity className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalComments}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Likes</p>
                    <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalLikes}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Follows</p>
                    <UserPlus className="w-5 h-5 md:w-8 md:h-8 text-secondary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalFollows}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Ratings</p>
                    <Star className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalRatings}</p>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Saved</p>
                    <Bookmark className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalSavedDrills}</p>
                </div>
              </Card>
            </div>
          )}

        {/* Content Tabs - Mobile Optimized */}
        <Card className="p-3 md:p-6">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-4 md:mb-6 w-full grid grid-cols-4 md:flex md:w-auto h-auto">
              <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
              <TabsTrigger value="drills" className="text-xs md:text-sm">Drills</TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs md:text-sm">Sessions</TabsTrigger>
              <TabsTrigger value="comments" className="text-xs md:text-sm">Comments</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs md:text-sm">Referrals</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="collections" className="text-xs md:text-sm">Collections</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs md:text-sm">Audit</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs md:text-sm">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <AdminFiltersComponent
                filters={userFilters}
                onFiltersChange={setUserFilters}
                filterType="users"
              />

              {loading ? (
                <AdminTableSkeleton />
              ) : filteredUsers.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </p>
                </Card>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Name</TableHead>
                        <TableHead className="min-w-[180px] hidden sm:table-cell">Email</TableHead>
                        <TableHead className="min-w-[100px]">Sport</TableHead>
                        <TableHead className="min-w-[100px] hidden md:table-cell">Club</TableHead>
                        <TableHead className="min-w-[100px] hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="min-w-[140px]">Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-sm">{user.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">{user.sport}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{user.club || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <RoleManagement
                            userId={user.id}
                            userName={user.name}
                            currentRole={user.user_roles?.[0]?.role || 'user'}
                            onRoleChange={handleUpdateUserRole}
                            disabled={updatingUser === user.id}
                          />
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="drills" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search drills by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <AdminFiltersComponent
                filters={drillFilters}
                onFiltersChange={setDrillFilters}
                filterType="drills"
              />

              {loading ? (
                <AdminTableSkeleton />
              ) : filteredDrills.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No drills found matching your search" : "No drills found"}
                  </p>
                </Card>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead className="min-w-[150px]">Title</TableHead>
                      <TableHead className="min-w-[120px] hidden sm:table-cell">Author</TableHead>
                      <TableHead className="min-w-[100px]">Sport</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">Category</TableHead>
                      <TableHead className="min-w-[90px] hidden lg:table-cell">Status</TableHead>
                      <TableHead className="min-w-[100px] hidden xl:table-cell">Created</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrills.map((drill) => (
                      <TableRow key={drill.id}>
                        <TableCell className="font-medium text-sm">{drill.title}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{drill.profiles?.name}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="text-xs">{drill.sport}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{drill.category}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant={drill.published ? "default" : "secondary"} className="text-xs">
                            {drill.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          {new Date(drill.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/drill/${drill.id}`)}
                              className="hidden sm:inline-flex"
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteDrill(drill.id)}
                              disabled={deletingDrill === drill.id}
                            >
                              {deletingDrill === drill.id ? (
                                <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <AdminSessionsTable />
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <AdminCommentsTable loading={loading} onRefresh={loadAdminData} />
            </TabsContent>

            <TabsContent value="referrals" className="space-y-4">
              <AdminReferralsOverview />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AdminAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <AuditLogViewer />
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <OfficialCollectionManager />
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="grid gap-6 max-w-2xl">
                <AdminDigestTrigger />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Admin;
