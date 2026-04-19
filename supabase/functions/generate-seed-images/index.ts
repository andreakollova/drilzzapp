import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get batch size from query params (default 5 drills at a time)
    const url = new URL(req.url);
    const batchSize = parseInt(url.searchParams.get("batch") || "5");

    console.log(`Fetching up to ${batchSize} published drills without images...`);

    // Get limited number of published drills that don't have images yet
    const { data: drills, error: fetchError } = await supabase
      .from("drills")
      .select("id, title, sport, category, description, coaching_points")
      .eq("published", true)
      .is("image_url", null)
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch drills: ${fetchError.message}`);
    }

    if (!drills || drills.length === 0) {
      return new Response(
        JSON.stringify({ message: "No drills found without images", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${drills.length} drills to generate images for in this batch`);

    const results = [];

    for (const drill of drills) {
      try {
        console.log(`Generating image for drill: ${drill.title}`);

        // Call the generate-drill-diagram function
        const { data: imageData, error: genError } = await supabase.functions.invoke(
          "generate-drill-diagram",
          {
            body: {
              sport: drill.sport,
              category: drill.category,
              title: drill.title,
              description: `${drill.description}\n\nCoaching Points: ${drill.coaching_points}`
            }
          }
        );

        if (genError) {
          console.error(`Failed to generate image for ${drill.title}:`, genError);
          results.push({ drill: drill.title, status: "failed", error: genError.message });
          continue;
        }

        if (!imageData?.imageUrl) {
          console.error(`No image URL returned for ${drill.title}`);
          results.push({ drill: drill.title, status: "failed", error: "No image URL" });
          continue;
        }

        // Convert base64 to blob
        const base64Data = imageData.imageUrl.split(",")[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Upload to Supabase storage
        const fileName = `${drill.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("drill-images")
          .upload(fileName, binaryData, {
            contentType: "image/png",
            upsert: false
          });

        if (uploadError) {
          console.error(`Failed to upload image for ${drill.title}:`, uploadError);
          results.push({ drill: drill.title, status: "failed", error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("drill-images")
          .getPublicUrl(fileName);

        // Update drill with image URL
        const { error: updateError } = await supabase
          .from("drills")
          .update({ image_url: urlData.publicUrl })
          .eq("id", drill.id);

        if (updateError) {
          console.error(`Failed to update drill ${drill.title}:`, updateError);
          results.push({ drill: drill.title, status: "failed", error: updateError.message });
          continue;
        }

        console.log(`Successfully generated and uploaded image for ${drill.title}`);
        results.push({ drill: drill.title, status: "success", imageUrl: urlData.publicUrl });

        // Add a small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing drill ${drill.title}:`, error);
        results.push({ 
          drill: drill.title, 
          status: "failed", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.status === "success").length;
    const failCount = results.filter(r => r.status === "failed").length;

    // Check if there are more drills to process
    const { count } = await supabase
      .from("drills")
      .select("*", { count: "exact", head: true })
      .eq("published", true)
      .is("image_url", null);

    return new Response(
      JSON.stringify({ 
        message: `Batch complete: ${successCount} successful, ${failCount} failed`,
        processed: drills.length,
        successful: successCount,
        failed: failCount,
        remaining: count || 0,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-seed-images:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate seed images" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
