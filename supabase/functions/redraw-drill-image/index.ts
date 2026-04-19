import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, sport } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    // Field/court templates description based on sport
    const sportTemplates: Record<string, string> = {
      "Field Hockey": "field hockey pitch with proper dimensions, goal areas, and marking lines",
      "Football / Soccer": "soccer field with goals, penalty areas, center circle, and proper pitch markings",
      "Basketball": "basketball court with three-point line, free throw line, and proper court markings",
      "Volleyball": "volleyball court with net, attack lines, and proper court dimensions",
      "Floorball": "floorball rink with goals, corner areas, and proper court markings",
      "Tennis": "tennis court with net, service boxes, and proper court lines",
      "Ice Hockey": "ice hockey rink with goals, blue lines, face-off circles, and proper markings",
      "Rugby": "rugby field with try lines, goal posts, and proper field markings",
      "Handball": "handball court with goals, goal area, and proper court markings",
      "General Conditioning / Fitness": "training area with equipment zones and exercise stations"
    };

    const template = sportTemplates[sport] || "sports training area";

    // Drilzz branding specifications
    const brandingSpec = `
DRILZZ BRANDING REQUIREMENTS (MUST FOLLOW EXACTLY):

BACKGROUND & FIELD/COURT:
- Background: Pure white (#FFFFFF) - clean coach's whiteboard aesthetic
- Field/court lines: Gradient from hot pink (#E90044) to deep blue (#3635B5)
- Line weight: 2-3px for major boundary lines, 1-2px for minor lines
- Template: ${template}

COACHING NOTATION SYSTEM (USE EXACTLY THESE STYLES):
- Players: Numbered circles (1, 2, 3, etc.) with white fill and gradient outline stroke (hot pink to blue)
- Running paths: Solid gradient arrows (hot pink → blue) showing movement direction
- Passing lines: Dashed gradient lines with arrowheads at the end
- Dribbling: Wavy gradient lines
- Cones/markers: Small triangles with gradient fill (hot pink → blue)
- Goals/targets: Rectangle outlines with gradient stroke
- Ball position: Small filled circle with gradient fill

STYLE REQUIREMENTS:
- Clean, minimal, professional coaching diagram aesthetic
- High contrast for clarity
- Consistent gradient direction (hot pink at top/left, blue at bottom/right)
- Numbers and text in dark gray or black for readability
- No shadows, no 3D effects, flat design
- White background throughout (no green pitches or colored surfaces)
`;

    const prompt = `${brandingSpec}

Transform this hand-drawn drill diagram into a clean, professional ${sport} coaching diagram following the exact Drilzz branding specifications above.

Analyze the hand-drawn elements in the uploaded image:
- Player positions (dots/circles) → Convert to numbered circles with gradient outline
- Movement paths (arrows) → Convert to solid gradient arrows
- Passing lines → Convert to dashed gradient lines
- Equipment (cones/goals) → Convert to gradient triangles/rectangles
- Any other coaching marks → Apply consistent Drilzz notation style

Recreate the drill on a white background with gradient-lined ${template}.
Keep the same drill setup and movements from the original but apply Drilzz branding consistently.
Output a professional, publication-ready coaching diagram.`;

    console.log("Calling Google AI for image redraw...");

    // Extract base64 data and mime type from data URL if needed
    let imageData = imageBase64;
    let mimeType = "image/png";
    if (imageBase64.startsWith("data:")) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        imageData = matches[2];
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageData } }
            ]
          }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Google AI error:", response.status, errorText);
      throw new Error(`Google AI error: ${response.status}`);
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      throw new Error("No image generated by AI");
    }

    const generatedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    console.log("Successfully generated drill diagram");

    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in redraw-drill-image:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to redraw image" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
