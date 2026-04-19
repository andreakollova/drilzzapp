import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InviteDialog } from "@/components/InviteDialog";
import { Users, Copy } from "lucide-react";
import { format } from "date-fns";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";

interface Invite {
  id: string;
  invitee_email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  invite_code: string;
}

interface Profile {
  name: string;
  referral_count: number;
  avatar_url: string | null;
}

const Referrals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate("/login");
        return;
      }
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setFullProfile(profileData);

      const { data: invitesData, error: invitesError } = await supabase
        .from("invites")
        .select("*")
        .eq("inviter_id", user.id)
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;
      setInvites(invitesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/register?invite=${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied!",
      description: "Invite link copied to clipboard"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-600/30">Accepted</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation userId={user?.id} profile={fullProfile} />
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-4xl">
          <div className="mb-6">
            <div className="h-7 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <MobileBottomNav userId={user?.id} profile={profile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation userId={user?.id} profile={fullProfile} />

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl">Referrals</h1>
            {(profile?.referral_count || 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {profile?.referral_count} successful
              </Badge>
            )}
          </div>
          <InviteDialog />
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Invite coaches and earn badges at 5, 15, and 30 referrals
        </p>

        {/* Invites List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">Invitations</h2>
            <span className="text-xs text-muted-foreground">{invites.length} sent</span>
          </div>

          {invites.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No invitations yet
              </p>
              <InviteDialog />
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map(invite => (
                <div 
                  key={invite.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {invite.invitee_email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{invite.invitee_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invite.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invite.status)}
                    {invite.status === "pending" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCopyInviteLink(invite.invite_code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileBottomNav userId={user?.id} profile={profile} />
    </div>
  );
};

export default Referrals;
