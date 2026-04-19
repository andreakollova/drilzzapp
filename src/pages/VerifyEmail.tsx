import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const VerifyEmail = () => {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const email = sessionStorage.getItem('verificationEmail') || '';

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please try registering again.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "We've sent you a new verification email."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <Card className="p-8 shadow-strong">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <Target className="w-8 h-8 text-primary mb-2" />
            <h1 className="font-display text-3xl mb-2">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a verification link to
            </p>
            {email && (
              <p className="font-semibold text-foreground mt-1">{email}</p>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">1.</span>
                Open your email
              </h3>
              <p className="text-sm text-muted-foreground">
                Check your inbox (and spam folder) for the verification email from CoachHub
              </p>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">2.</span>
                Click the verification link
              </h3>
              <p className="text-sm text-muted-foreground">
                Click the "Verify Email Address" button in the email
              </p>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-primary">3.</span>
                Start coaching!
              </h3>
              <p className="text-sm text-muted-foreground">
                Once verified, you'll be redirected to your dashboard
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already verified?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>💡 Tip:</strong> The verification link expires in 24 hours. If it expires, use the resend button above.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
