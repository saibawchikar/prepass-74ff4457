import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, textContent, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log("Processing request with type:", type);
    console.log("Has image:", !!imageBase64);
    console.log("Has text:", !!textContent);

    const systemPrompt = `You are an expert educational content analyzer. Your task is to analyze study notes and generate high-quality learning materials.

When analyzing notes (either from text or images), you must:
1. Extract ALL key concepts, definitions, formulas, dates, and important facts
2. Generate flashcards with clear question-answer pairs
3. Create quiz questions (MCQs with 4 options)
4. Identify the most exam-likely important points

IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. Just pure JSON.

The JSON must follow this exact structure:
{
  "flashcards": [
    {"front": "question text", "back": "answer text"}
  ],
  "quizzes": [
    {"question": "question text", "options": ["option1", "option2", "option3", "option4"], "correctIndex": 0}
  ],
  "importantPoints": ["point 1", "point 2"],
  "summary": "Brief 2-3 sentence summary of the content"
}

Generate at least 5 flashcards and 3 quizzes from the content. Make them challenging but fair.`;

    let userContent: any;

    if (imageBase64) {
      // OCR + Analysis from image
      userContent = [
        {
          type: "text",
          text: "Analyze this image of study notes. Extract all text using OCR, then generate flashcards, quiz questions, and identify important exam-likely points. Return ONLY valid JSON.",
        },
        {
          type: "image_url",
          image_url: {
            url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ];
    } else if (textContent) {
      // Analysis from text
      userContent = `Analyze these study notes and generate flashcards, quiz questions, and identify important exam-likely points. Return ONLY valid JSON.\n\nNotes:\n${textContent}`;
    } else {
      throw new Error("No content provided");
    }

    console.log("Sending request to AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    console.log("Parsing AI response...");
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Successfully parsed content:", {
      flashcards: parsedContent.flashcards?.length || 0,
      quizzes: parsedContent.quizzes?.length || 0,
      importantPoints: parsedContent.importantPoints?.length || 0,
    });

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-notes function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
