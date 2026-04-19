import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sport-specific template definitions
const sportTemplates: Record<string, string> = {
  "Field Hockey": "field hockey pitch with proper dimensions, 25-yard lines, shooting circles (D), center line, and goals at each end",
  "Football / Soccer": "soccer field with penalty boxes, center circle, goal areas, corner arcs, and proper pitch markings",
  "Basketball": "basketball half-court with three-point arc, key/paint area, free-throw line, and basket",
  "Volleyball": "volleyball court with attack lines (3-meter lines), center net line, and rotation position markers",
  "Floorball": "floorball rink with rounded corners, goal creases, and center line",
  "Tennis": "tennis court with service boxes, singles/doubles lines, baseline, and net",
  "Ice Hockey": "ice hockey rink with blue lines, red center line, face-off circles, goal creases, and boards",
  "Rugby": "rugby field with try lines, 22-meter lines, halfway line, 10-meter lines, and posts",
  "Handball": "handball court with 6-meter goal area line, 9-meter free-throw line, goal area, and center line",
  "General Conditioning / Fitness": "training area grid with marked zones for different exercise stations"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sport, category, description, title } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

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

DRILL CONTENT TO ILLUSTRATE:
Sport: ${sport}
Category: ${category}
Title: ${title}
Description: ${description}

Create a professional coaching drill diagram following the exact Drilzz branding specifications above.
Analyze the drill description and illustrate:
- Player starting positions (numbered circles with gradient outline)
- Movement patterns (solid gradient arrows)
- Passing sequences (dashed gradient lines)
- Equipment placement (gradient triangles for cones)
- Key coaching points shown visually

The diagram must use the white background with gradient-lined ${template}.
Output a clear, minimal, professional coaching diagram ready for publication.`;

    console.log("Calling Google AI for drill diagram generation...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
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

    console.log("Successfully generated Drilzz-branded drill diagram");

    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-drill-diagram:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate diagram" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
