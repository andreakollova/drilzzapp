import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, UserCheck, Clock, TrendingUp, Trophy } from "lucide-react";

interface ReferralStats {
  totalInvites: number;
  acceptedInvites: number;
  pendingInvites: number;
  expiredInvites: number;
  acceptanceRate: number;
}

interface TopReferrer {
  user_id: string;
  name: string;
  avatar_url: string | null;
  referral_count: number;
}

export const AdminReferralsOverview = () => {
  const [stats, setStats] = useState<ReferralStats>({
    totalInvites: 0,
    acceptedInvites: 0,
    pendingInvites: 0,
    expiredInvites: 0,
    acceptanceRate: 0,
  });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // Fetch all invites
      const { data: invites, error: invitesError } = await supabase
        .from("invites")
        .select("*");

      if (invitesError) throw invitesError;

      const now = new Date();
      const totalInvites = invites?.length || 0;
      const acceptedInvites = invites?.filter(i => i.status === "accepted").length || 0;
      const pendingInvites = invites?.filter(i => i.status === "pending" && new Date(i.expires_at) > now).length || 0;
      const expiredInvites = invites?.filter(i => i.status === "pending" && new Date(i.expires_at) <= now).length || 0;
      const acceptanceRate = totalInvites > 0 ? (acceptedInvites / totalInvites) * 100 : 0;

      setStats({
        totalInvites,
        acceptedInvites,
        pendingInvites,
        expiredInvites,
        acceptanceRate,
      });

      // Fetch top referrers from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, referral_count")
        .gt("referral_count", 0)
        .order("referral_count", { ascending: false })
        .limit(10);

      if (profilesError) throw profilesError;

      setTopReferrers(
        profiles?.map(p => ({
          user_id: p.id,
          name: p.name,
          avatar_url: p.avatar_url,
          referral_count: p.referral_count,
        })) || []
      );
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invites</p>
                <p className="text-2xl font-bold">{stats.totalInvites}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{stats.acceptedInvites}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingInvites}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Referrers Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No referrals yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead className="text-right">Referrals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topReferrers.map((referrer, index) => (
                    <TableRow key={referrer.user_id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={referrer.avatar_url || undefined} />
                            <AvatarFallback>
                              {referrer.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate max-w-[150px]">
                            {referrer.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {referrer.referral_count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Conversion Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accepted</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.totalInvites > 0 ? (stats.acceptedInvites / stats.totalInvites) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{stats.acceptedInvites}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${stats.totalInvites > 0 ? (stats.pendingInvites / stats.totalInvites) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{stats.pendingInvites}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expired</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive rounded-full"
                      style={{ width: `${stats.totalInvites > 0 ? (stats.expiredInvites / stats.totalInvites) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{stats.expiredInvites}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Conversion Rate</span>
                  <span className="text-2xl font-bold text-primary">
                    {stats.acceptanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
