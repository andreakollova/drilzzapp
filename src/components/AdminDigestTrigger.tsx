import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

export const AdminDigestTrigger = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerDigest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-weekly-digest");

      if (error) throw error;

      toast({
        title: "Digest Sent Successfully",
        description: `${data.emailsSent} emails sent, ${data.emailsSkipped} skipped`,
      });
    } catch (error: any) {
      console.error("Error triggering digest:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send digest",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Weekly Digest
        </CardTitle>
        <CardDescription>
          Manually trigger the weekly digest email to all users. This is normally sent automatically every Monday at 9 AM UTC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleTriggerDigest}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Digests...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Weekly Digest Now
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          This will send digest emails to all users who have email_digest enabled in their preferences and have activity in the past week.
        </p>
      </CardContent>
    </Card>
  );
};
