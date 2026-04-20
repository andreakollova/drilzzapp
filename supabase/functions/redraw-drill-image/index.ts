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
DRILZZ BRANDING — APPLY EXACTLY:

COLORS (use only these):
- Background: Pure white (#FFFFFF) always — no exceptions
- Primary accent: Coral orange (#F6824D)
- Dark: Charcoal (#272B35)
- All lines, arrows, outlines: coral orange (#F6824D)
- All filled shapes: coral orange (#F6824D) fill or charcoal (#272B35) fill
- Text/numbers: charcoal (#272B35)

NOTATION STYLE:
- Players: Numbered circles, white fill, coral orange (#F6824D) outline stroke (2px)
- Running arrows: solid coral orange arrows
- Passing lines: dashed coral orange lines with arrowhead
- Dribble: wavy coral orange line
- Shot: bold coral orange arrow
- Cones: small coral orange filled triangles
- Goals/zones: charcoal (#272B35) rectangle outline
- Ball: small coral orange filled circle

STYLE: flat, clean, minimal, no shadows, no gradients, no green pitch, white background only.
`;

    const prompt = `You are a diagram tracer, not a diagram designer. Your ONLY job is to trace exactly what is drawn in the image and redraw it cleanly.

ABSOLUTE RULES — ZERO EXCEPTIONS:
1. COUNT every element in the image. Draw EXACTLY that many — no more, no less.
2. TRACE every line, arrow, circle, shape in its EXACT position on the canvas.
3. COPY every arrow direction EXACTLY as drawn — never rotate, flip or redirect.
4. COPY every element's size and spacing EXACTLY as in the original.
5. DO NOT add any element that is not in the original.
6. DO NOT remove any element that IS in the original.
7. DO NOT move any element from its original position.
8. DO NOT interpret what the drill means. You are a copy machine, not a coach.
9. White background ONLY — no pitch, no field, no green, no texture, nothing.

STYLE (apply to the traced elements):
- Background: white (#FFFFFF)
- All lines, arrows: coral orange (#F6824D), 2-3px stroke
- Circles (players): white fill, coral orange (#F6824D) 2px outline
- Numbers inside circles: charcoal (#272B35)
- Dashed lines: coral orange (#F6824D) dashed
- Triangles/cones: coral orange (#F6824D) filled
- Rectangles/goals: charcoal (#272B35) outline

Think of it this way: if the original has 2 circles and 1 arrow going RIGHT, your output must have exactly 2 circles and exactly 1 arrow going RIGHT. Nothing else.`;

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_AI_API_KEY}`,
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
          generationConfig: { responseModalities: ["IMAGE", "TEXT"], temperature: 0 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI error:", response.status, errorText);
      throw new Error(`Google AI error ${response.status}: ${errorText}`);
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
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in redraw-drill-image:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
