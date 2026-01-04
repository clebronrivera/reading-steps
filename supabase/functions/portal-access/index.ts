import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PortalRequest {
  action: "validate" | "get_data" | "update_checklist" | "submit_scale" | "request_teacher_input";
  token: string;
  payload?: Record<string, unknown>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, token, payload }: PortalRequest = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate token and get student_id
    const { data: studentId, error: tokenError } = await supabase.rpc(
      "validate_portal_token",
      { token_value: token }
    );

    if (tokenError || !studentId) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: unknown;

    switch (action) {
      case "validate":
        result = { valid: true, studentId };
        break;

      case "get_data":
        // Get student info
        const { data: student } = await supabase
          .from("students")
          .select("id, full_name, grade, school, risk_level, primary_concerns")
          .eq("id", studentId)
          .single();

        // Get latest session with summary
        const { data: sessions } = await supabase
          .from("sessions")
          .select(`
            id, status, started_at, ended_at,
            session_summaries (*)
          `)
          .eq("student_id", studentId)
          .order("started_at", { ascending: false })
          .limit(1);

        const latestSession = sessions?.[0];

        // Get domain scores
        const { data: domainScores } = await supabase
          .from("domain_scores")
          .select("*")
          .eq("session_id", latestSession?.id || "");

        // Get checklist items
        const { data: checklistItems } = await supabase
          .from("parent_checklist_items")
          .select("*")
          .eq("student_id", studentId)
          .order("priority", { ascending: true });

        // Get parent scales
        const { data: parentScales } = await supabase
          .from("parent_scales")
          .select("*")
          .eq("student_id", studentId);

        // Get teacher input requests
        const { data: teacherRequests } = await supabase
          .from("teacher_input_requests")
          .select("*")
          .eq("student_id", studentId);

        result = {
          student,
          session: latestSession,
          domainScores: domainScores || [],
          checklistItems: checklistItems || [],
          parentScales: parentScales || [],
          teacherRequests: teacherRequests || [],
        };
        break;

      case "update_checklist":
        const { itemId, isCompleted } = payload as { itemId: string; isCompleted: boolean };
        const { error: updateError } = await supabase
          .from("parent_checklist_items")
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq("id", itemId)
          .eq("student_id", studentId);

        if (updateError) throw updateError;
        result = { success: true };
        break;

      case "submit_scale":
        const { scaleType, responses } = payload as { scaleType: string; responses: Record<string, unknown> };
        
        // Upsert the scale
        const { error: scaleError } = await supabase
          .from("parent_scales")
          .upsert({
            student_id: studentId,
            scale_type: scaleType,
            responses,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "student_id,scale_type" });

        if (scaleError) throw scaleError;
        result = { success: true };
        break;

      case "request_teacher_input":
        const { teacherEmail, teacherName, questions } = payload as {
          teacherEmail: string;
          teacherName: string;
          questions: string[];
        };

        const { error: teacherError } = await supabase
          .from("teacher_input_requests")
          .insert({
            student_id: studentId,
            teacher_email: teacherEmail,
            teacher_name: teacherName,
            questions,
            status: "pending",
          });

        if (teacherError) throw teacherError;
        result = { success: true };
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Portal access error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
