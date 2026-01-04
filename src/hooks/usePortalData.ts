import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  full_name: string;
  grade: string;
  school: string | null;
  risk_level: "low" | "moderate" | "high" | "critical" | null;
  primary_concerns: string[] | null;
}

interface DomainScore {
  id: string;
  domain: string;
  raw_score: number | null;
  max_score: number | null;
  percentile: number | null;
  risk_level: "low" | "moderate" | "high" | "critical" | null;
  notes: string | null;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  category: "immediate" | "school" | "home" | "professional";
  priority: number;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
}

interface ParentScale {
  id: string;
  scale_type: string;
  responses: Record<string, unknown>;
  completed_at: string | null;
}

interface TeacherRequest {
  id: string;
  teacher_email: string | null;
  teacher_name: string | null;
  questions: string[];
  status: "pending" | "sent" | "completed";
  responses: Record<string, unknown> | null;
}

interface SessionSummary {
  id: string;
  risk_level: "low" | "moderate" | "high" | "critical" | null;
  observations: string | null;
  strengths: string | null;
  needs_risk_indicators: string | null;
  recommendations_parents: string | null;
  recommendations_school: string | null;
  next_steps: string | null;
  report_tier: "free" | "paid" | null;
  unlocked_at: string | null;
}

interface Session {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  session_summaries: SessionSummary | null;
}

interface PortalData {
  student: Student | null;
  session: Session | null;
  domainScores: DomainScore[];
  checklistItems: ChecklistItem[];
  parentScales: ParentScale[];
  teacherRequests: TeacherRequest[];
}

export function usePortalData(token: string | null) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("No access token provided");
      return;
    }

    try {
      setLoading(true);
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "portal-access",
        {
          body: { action: "get_data", token },
        }
      );

      if (fnError) throw fnError;
      if (result.error) throw new Error(result.error);

      setData(result);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portal data");
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateChecklist = async (itemId: string, isCompleted: boolean) => {
    if (!token) return;

    const { error: fnError } = await supabase.functions.invoke("portal-access", {
      body: {
        action: "update_checklist",
        token,
        payload: { itemId, isCompleted },
      },
    });

    if (!fnError) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: prev.checklistItems.map((item) =>
            item.id === itemId
              ? { ...item, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
              : item
          ),
        };
      });
    }
  };

  const submitScale = async (scaleType: string, responses: Record<string, unknown>) => {
    if (!token) return;

    const { error: fnError } = await supabase.functions.invoke("portal-access", {
      body: {
        action: "submit_scale",
        token,
        payload: { scaleType, responses },
      },
    });

    if (!fnError) {
      fetchData();
    }
  };

  const requestTeacherInput = async (
    teacherEmail: string,
    teacherName: string,
    questions: string[]
  ) => {
    if (!token) return;

    const { error: fnError } = await supabase.functions.invoke("portal-access", {
      body: {
        action: "request_teacher_input",
        token,
        payload: { teacherEmail, teacherName, questions },
      },
    });

    if (!fnError) {
      fetchData();
    }
  };

  return {
    data,
    loading,
    error,
    isValid,
    refetch: fetchData,
    updateChecklist,
    submitScale,
    requestTeacherInput,
  };
}
