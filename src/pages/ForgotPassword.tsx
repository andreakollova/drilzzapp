import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Target, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // Send custom email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: values.email,
          resetUrl: redirectUrl
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
      }

      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link if an account exists with that email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <Card className="p-8 shadow-strong text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-3xl mb-4">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <Card className="p-8 shadow-strong">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-10 h-10 text-primary" />
            <div>
              <h1 className="font-display text-3xl">Forgot Password?</h1>
              <p className="text-muted-foreground">Enter your email to reset it</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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

              <Button 
                type="submit" 
                className="w-full text-lg h-12" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
