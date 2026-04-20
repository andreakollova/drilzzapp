import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" });

export const InviteDialog = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleInvite = async () => {
    try {
      // Validate email
      const validationResult = emailSchema.safeParse(email);
      if (!validationResult.success) {
        toast({
          title: "Invalid Email",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to send invites");
      }

      // Get user profile for name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Generate invite code
      const inviteCode = generateInviteCode();

      // Create invite record
      const { error: inviteError } = await supabase
        .from("invites")
        .insert({
          inviter_id: user.id,
          invitee_email: email.trim(),
          invite_code: inviteCode,
          status: "pending",
        });

      if (inviteError) throw inviteError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke("send-invite", {
        body: {
          inviteeEmail: email.trim(),
          inviteCode: inviteCode,
          inviterName: profile.name,
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${email}`,
      });

      setEmail("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast({
        title: "Failed to Send Invite",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Coach
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Coach</DialogTitle>
          <DialogDescription>
            Invite other coaches to join Drilzz. You'll earn rewards when they sign up!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleInvite}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
