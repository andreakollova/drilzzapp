import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  inviteeEmail: string;
  inviteCode: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send invite function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { inviteeEmail, inviteCode, inviterName }: InviteRequest = await req.json();
    console.log("Sending invite to:", inviteeEmail, "from:", inviterName);

    const inviteUrl = `https://drilzz.com/register?invite=${inviteCode}`;

    const emailResponse = await resend.emails.send({
      from: "Drilzz <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `${inviterName} invited you to join Drilzz!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited to Drilzz</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Drilzz</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Multi-Sport Coaching Platform</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">You've Been Invited!</h2>
                <p style="color: #52525b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  <strong>${inviterName}</strong> has invited you to join Drilzz, the leading platform for coaches to create, share, and discover coaching drills across 10+ sports.
                </p>
...
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(233, 0, 68, 0.3);">
                    Accept Invitation
                  </a>
                </div>
                
                <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0; text-align: center;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${inviteUrl}" style="color: #E90044; word-break: break-all; font-size: 12px;">${inviteUrl}</a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #fafafa; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                <p style="color: #71717a; font-size: 12px; margin: 0;">
                  This invitation was sent by ${inviterName} via Drilzz.<br>
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
