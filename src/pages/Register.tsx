import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Gift, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import drilzzLogo from "@/assets/logo-black.png";

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

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  sport: z.string().min(1, "Please select a sport"),
  club: z.string().max(100, "Club name must be less than 100 characters").optional(),
  teams: z.string().max(200, "Teams must be less than 200 characters").optional(),
  country: z.string().max(100, "Country must be less than 100 characters").optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional()
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [existingUserEmail, setExistingUserEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const inviteCode = searchParams.get("invite");

  useEffect(() => {
    // Load inviter info if invite code is present
    if (inviteCode) {
      loadInviterInfo();
    }
  }, [inviteCode]);

  const loadInviterInfo = async () => {
    if (!inviteCode) return;

    try {
      const { data: invite, error } = await supabase
        .from("invites")
        .select("inviter_id, profiles!inviter_id(name)")
        .eq("invite_code", inviteCode)
        .eq("status", "pending")
        .single();

      if (!error && invite) {
        setInviterName((invite as any).profiles?.name || null);
      }
    } catch (error) {
      console.error("Error loading inviter info:", error);
    }
  };

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      sport: "",
      club: "",
      teams: "",
      country: "",
      bio: ""
    }
  });

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to sign up with Google",
        variant: "destructive"
      });
    }
  };

  const handleResendVerification = async () => {
    if (!existingUserEmail) return;
    
    setIsResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: existingUserEmail,
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox and spam folder"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setExistingUserEmail(null); // Reset existing user state
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: values.name,
            sport: values.sport,
            club: values.club || "",
            teams: values.teams || "",
            country: values.country || "",
            bio: values.bio || ""
          }
        }
      });

      if (error) throw error;

      // Check if user already exists but hasn't confirmed email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setExistingUserEmail(values.email);
        return;
      }

      if (data.user) {
        // Handle invite code if present
        if (inviteCode) {
          // Mark invite as accepted
          await supabase
            .from("invites")
            .update({
              status: "accepted",
              accepted_by: data.user.id,
              accepted_at: new Date().toISOString(),
            })
            .eq("invite_code", inviteCode)
            .eq("status", "pending");
        }

        // Store email for verification page
        sessionStorage.setItem('verificationEmail', values.email);

        toast({
          title: "Success!",
          description: "Please check your email to verify your account"
        });
        
        navigate("/verify-email");
      }
    } catch (error: any) {
      // Check for specific error messages about existing users
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("already registered") || 
          errorMessage.includes("already exists") ||
          errorMessage.includes("user already registered")) {
        setExistingUserEmail(values.email);
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "An error occurred during registration",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="p-8 shadow-strong">
          <div className="flex flex-col items-center gap-4 mb-8">
            <img src={drilzzLogo} alt="Drilzz" className="h-12" />
            <div className="text-center">
              <h1 className="font-display text-3xl">Join Drilzz</h1>
              <p className="text-muted-foreground">Create your coaching profile</p>
            </div>
          </div>

          {inviterName && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700">You've been invited by {inviterName}!</p>
                <p className="text-sm text-green-600">Join to connect with the coaching community</p>
              </div>
            </div>
          )}

          {existingUserEmail && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Already Exists</AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <p>An account with <strong>{existingUserEmail}</strong> already exists.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="flex-1"
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                    className="flex-1"
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              Or continue with email
            </span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="coach@example.com"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Sport *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="club"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club / Academy</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City United FC"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teams Coached</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="U12, U14, Women's"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="United States"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your coaching philosophy and experience..."
                        rows={4}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full gradient-hero text-lg h-12" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
