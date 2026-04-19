import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's token to verify identity
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log(`Deleting account for user: ${user.id}`);

    // Delete user's storage files from avatars bucket
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from("avatars")
        .list(user.id);

      if (avatarFiles && avatarFiles.length > 0) {
        const avatarPaths = avatarFiles.map((file) => `${user.id}/${file.name}`);
        await supabaseAdmin.storage.from("avatars").remove(avatarPaths);
        console.log(`Deleted ${avatarPaths.length} avatar files`);
      }
    } catch (error) {
      console.error("Error deleting avatar files:", error);
    }

    // Delete user's drill images
    try {
      const { data: drills } = await supabaseAdmin
        .from("drills")
        .select("id")
        .eq("user_id", user.id);

      if (drills && drills.length > 0) {
        for (const drill of drills) {
          const { data: drillFiles } = await supabaseAdmin.storage
            .from("drill-images")
            .list(drill.id);

          if (drillFiles && drillFiles.length > 0) {
            const drillFilePaths = drillFiles.map(
              (file) => `${drill.id}/${file.name}`
            );
            await supabaseAdmin.storage.from("drill-images").remove(drillFilePaths);
          }
        }
        console.log(`Deleted drill images for ${drills.length} drills`);
      }
    } catch (error) {
      console.error("Error deleting drill images:", error);
    }

    // Delete user's drill videos
    try {
      const { data: drills } = await supabaseAdmin
        .from("drills")
        .select("id")
        .eq("user_id", user.id);

      if (drills && drills.length > 0) {
        for (const drill of drills) {
          const { data: videoFiles } = await supabaseAdmin.storage
            .from("drill-videos")
            .list(drill.id);

          if (videoFiles && videoFiles.length > 0) {
            const videoFilePaths = videoFiles.map(
              (file) => `${drill.id}/${file.name}`
            );
            await supabaseAdmin.storage.from("drill-videos").remove(videoFilePaths);
          }
        }
        console.log(`Deleted drill videos for ${drills.length} drills`);
      }
    } catch (error) {
      console.error("Error deleting drill videos:", error);
    }

    // Delete the auth user (this will cascade delete all related data via foreign keys)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted user account: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-user-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
