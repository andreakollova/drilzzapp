import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationSummary {
  followers: number;
  likes: number;
  comments: number;
  replies: number;
  notifications: Array<{
    type: string;
    message: string;
    created_at: string;
    actor_name?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Weekly digest function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate date range (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all active users who want email notifications
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, notification_preferences")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Processing digests for ${profiles?.length || 0} users`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const profile of profiles || []) {
      try {
        // Check notification preferences
        const prefs = profile.notification_preferences as any;
        if (prefs && prefs.email_digest === false) {
          console.log(`Skipping user ${profile.id} - digest disabled`);
          emailsSkipped++;
          continue;
        }

        // Get notifications from the past week
        const { data: notifications, error: notifError } = await supabaseAdmin
          .from("notifications")
          .select(`
            *,
            profiles!notifications_actor_id_fkey(name)
          `)
          .eq("user_id", profile.id)
          .gte("created_at", oneWeekAgo.toISOString())
          .order("created_at", { ascending: false });

        if (notifError) {
          console.error(`Error fetching notifications for user ${profile.id}:`, notifError);
          continue;
        }

        // Skip if no notifications
        if (!notifications || notifications.length === 0) {
          console.log(`No notifications for user ${profile.id}`);
          emailsSkipped++;
          continue;
        }

        // Summarize notifications by type
        const summary: NotificationSummary = {
          followers: notifications.filter(n => n.type === 'follower').length,
          likes: notifications.filter(n => n.type === 'like').length,
          comments: notifications.filter(n => n.type === 'comment').length,
          replies: notifications.filter(n => n.type === 'reply').length,
          notifications: notifications.slice(0, 10).map(n => ({
            type: n.type,
            message: n.message,
            created_at: n.created_at,
            actor_name: (n as any).profiles?.name
          }))
        };

        // Send digest email
        const emailResponse = await resend.emails.send({
          from: "Drilzz <onboarding@resend.dev>",
          to: [profile.email],
          subject: `Your weekly Drilzz digest - ${summary.followers + summary.likes + summary.comments + summary.replies} new updates`,
          html: generateDigestHTML(profile.name, summary),
        });

        console.log(`Digest sent to ${profile.email}:`, emailResponse);
        emailsSent++;

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        emailsSkipped,
        totalUsers: profiles?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-digest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

const generateDigestHTML = (name: string, summary: NotificationSummary): string => {
  const totalActivity = summary.followers + summary.likes + summary.comments + summary.replies;
  
  const activitySections = [];
  
  if (summary.followers > 0) {
    activitySections.push(`
      <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
          👥 ${summary.followers} New Follower${summary.followers !== 1 ? 's' : ''}
        </h3>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          More coaches are following your work!
        </p>
      </div>
    `);
  }
  
  if (summary.likes > 0) {
    activitySections.push(`
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #b91c1c; font-size: 18px; font-weight: 600;">
          ❤️ ${summary.likes} New Like${summary.likes !== 1 ? 's' : ''}
        </h3>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Your drills are getting appreciated!
        </p>
      </div>
    `);
  }
  
  if (summary.comments > 0) {
    activitySections.push(`
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #15803d; font-size: 18px; font-weight: 600;">
          💬 ${summary.comments} New Comment${summary.comments !== 1 ? 's' : ''}
        </h3>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Coaches are engaging with your drills!
        </p>
      </div>
    `);
  }
  
  if (summary.replies > 0) {
    activitySections.push(`
      <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #a16207; font-size: 18px; font-weight: 600;">
          💭 ${summary.replies} New Repl${summary.replies !== 1 ? 'ies' : 'y'}
        </h3>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Your comments got responses!
        </p>
      </div>
    `);
  }

  const recentActivityHTML = summary.notifications.length > 0 ? `
    <div style="margin-top: 32px;">
      <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Recent Activity</h3>
      <div style="background-color: #fafafa; border-radius: 8px; padding: 16px;">
        ${summary.notifications.map(n => `
          <div style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
            <p style="margin: 0; color: #18181b; font-size: 14px;">${n.message}</p>
            <p style="margin: 4px 0 0 0; color: #71717a; font-size: 12px;">
              ${new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Your Weekly Digest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Drilzz Activity Summary</p>
          </div>
...
            <!-- Summary Card -->
            <div style="background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center; color: white;">
              <p style="margin: 0 0 8px 0; font-size: 48px; font-weight: 800;">${totalActivity}</p>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Total Interactions This Week</p>
            </div>

            <!-- Activity Breakdown -->
            ${activitySections.join('')}

            ${recentActivityHTML}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://drilzz.com/notifications" style="display: inline-block; background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(233, 0, 68, 0.3);">
                View All Notifications
              </a>
            </div>
...
          <!-- Footer -->
          <div style="background-color: #fafafa; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
              You're receiving this weekly digest because you're a Drilzz member.
            </p>
            <p style="color: #71717a; font-size: 12px; margin: 0;">
              <a href="https://drilzz.com/settings" style="color: #E90044; text-decoration: none;">Update email preferences</a> • 
              Drilzz © ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

serve(handler);
