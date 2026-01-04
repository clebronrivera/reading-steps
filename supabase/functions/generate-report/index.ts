import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface SessionData {
  sessionId: string;
  student: {
    full_name: string;
    grade: string;
    primary_concerns: string[] | null;
    parent_observations: string | null;
    school: string | null;
    languages_at_home: string[] | null;
    el_status: boolean | null;
    speech_language_history: string | null;
    interventions_tried: string | null;
  };
  responses: Array<{
    subtest_name: string;
    module_type: string;
    score_code: string;
    error_type: string | null;
    strategy_tag: string | null;
    notes: string | null;
  }>;
  domainScores: Array<{
    domain: string;
    raw_score: number | null;
    max_score: number | null;
    risk_level: string | null;
  }>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating report for session: ${sessionId}`);

    // Fetch session with student info
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        id, status, started_at, ended_at, observations,
        students (
          full_name, grade, primary_concerns, parent_observations,
          school, languages_at_home, el_status, speech_language_history,
          interventions_tried
        )
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Session fetch error:", sessionError);
      throw new Error("Session not found");
    }

    // Fetch responses with subtest info
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select(`
        score_code, error_type, strategy_tag, notes, item_index,
        subtests (name, module_type, description)
      `)
      .eq("session_id", sessionId)
      .order("item_index", { ascending: true });

    if (responsesError) {
      console.error("Responses fetch error:", responsesError);
    }

    // Fetch domain scores
    const { data: domainScores, error: scoresError } = await supabase
      .from("domain_scores")
      .select("*")
      .eq("session_id", sessionId);

    if (scoresError) {
      console.error("Domain scores fetch error:", scoresError);
    }

    // Build context for AI
    const student = Array.isArray(session.students) ? session.students[0] : session.students;
    if (!student) {
      throw new Error("Student data not found");
    }
    const responsesSummary = (responses || []).map((r: any) => ({
      subtest: r.subtests?.name || "Unknown",
      module: r.subtests?.module_type || "unknown",
      score: r.score_code,
      error: r.error_type,
      strategy: r.strategy_tag,
      notes: r.notes,
    }));

    // Calculate response statistics
    const totalResponses = responsesSummary.length;
    const correctCount = responsesSummary.filter((r) => r.score === "correct").length;
    const incorrectCount = responsesSummary.filter((r) => r.score === "incorrect").length;
    const selfCorrectCount = responsesSummary.filter((r) => r.score === "self_correct").length;
    const noResponseCount = responsesSummary.filter((r) => r.score === "no_response").length;

    // Group errors by type
    const errorTypes = responsesSummary
      .filter((r) => r.error)
      .reduce((acc: Record<string, number>, r) => {
        acc[r.error] = (acc[r.error] || 0) + 1;
        return acc;
      }, {});

    // Group by module for pattern analysis
    const moduleBreakdown = responsesSummary.reduce((acc: Record<string, { correct: number; total: number }>, r) => {
      if (!acc[r.module]) acc[r.module] = { correct: 0, total: 0 };
      acc[r.module].total++;
      if (r.score === "correct") acc[r.module].correct++;
      return acc;
    }, {});

    const systemPrompt = `You are an expert educational specialist analyzing a virtual reading screening session for a child. Your role is to:
1. Analyze response patterns to identify strengths and areas of concern
2. Determine risk level based on patterns (low, moderate, high, or critical)
3. Provide parent-friendly observations and recommendations
4. Suggest evidence-based intervention strategies for home and school
5. Generate clear, actionable next steps

IMPORTANT GUIDELINES:
- This is a SCREENING, not a diagnosis. Never diagnose dyslexia or any learning disability.
- Use encouraging, supportive language for parents
- Be specific about observed patterns, not vague generalizations
- Recommendations should be practical and achievable
- Consider the child's grade level when evaluating performance
- Mention if patterns suggest need for comprehensive evaluation

Respond in JSON format with these exact fields:
{
  "risk_level": "low" | "moderate" | "high" | "critical",
  "observations": "Detailed paragraph about session observations and child's engagement",
  "strengths": "Paragraph highlighting observed strengths and skills",
  "needs_risk_indicators": "Paragraph about areas of concern and risk indicators observed",
  "recommendations_parents": "Numbered list of specific recommendations for parents",
  "recommendations_school": "Numbered list of specific recommendations to share with school",
  "intervention_plan_home": "Specific activities and strategies for home practice",
  "intervention_plan_school": "Suggested school-based interventions and accommodations",
  "next_steps": "Clear action items in order of priority"
}`;

    const userPrompt = `Please analyze this reading screening session:

STUDENT INFORMATION:
- Name: ${student.full_name}
- Grade: ${student.grade}
- School: ${student.school || "Not specified"}
- Primary Concerns from Parent: ${student.primary_concerns?.join(", ") || "None specified"}
- Parent Observations: ${student.parent_observations || "None"}
- Languages at Home: ${student.languages_at_home?.join(", ") || "English"}
- English Learner Status: ${student.el_status ? "Yes" : "No"}
- Speech/Language History: ${student.speech_language_history || "None reported"}
- Previous Interventions: ${student.interventions_tried || "None reported"}

SESSION STATISTICS:
- Total Items Administered: ${totalResponses}
- Correct: ${correctCount} (${totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0}%)
- Incorrect: ${incorrectCount} (${totalResponses > 0 ? Math.round((incorrectCount / totalResponses) * 100) : 0}%)
- Self-Corrections: ${selfCorrectCount}
- No Response: ${noResponseCount}

ERROR PATTERNS:
${Object.entries(errorTypes).map(([type, count]) => `- ${type}: ${count} occurrences`).join("\n") || "- No specific error patterns recorded"}

PERFORMANCE BY MODULE:
${Object.entries(moduleBreakdown).map(([module, data]) => 
  `- ${module}: ${data.correct}/${data.total} correct (${Math.round((data.correct / data.total) * 100)}%)`
).join("\n") || "- No module data available"}

DOMAIN SCORES:
${(domainScores || []).map((d: any) => 
  `- ${d.domain}: ${d.raw_score}/${d.max_score} ${d.risk_level ? `(${d.risk_level} risk)` : ""}`
).join("\n") || "- Domain scores not yet calculated"}

ITEM-LEVEL NOTES FROM ASSESSOR:
${responsesSummary.filter((r) => r.notes).map((r) => `- [${r.subtest}] ${r.notes}`).join("\n") || "- No specific notes recorded"}

Based on this data, generate a comprehensive screening report with observations, strengths, concerns, and actionable recommendations.`;

    console.log("Calling Lovable AI for report generation...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("AI response received, parsing...");

    let report;
    try {
      report = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Invalid response format from AI");
    }

    console.log("Report generated successfully");

    return new Response(JSON.stringify({ report, sessionId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Generate report error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate report";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
