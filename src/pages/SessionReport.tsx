import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIReportGenerator } from "@/components/reports/AIReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface SessionData {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  students: {
    id: string;
    full_name: string;
    grade: string;
    school: string | null;
    risk_level: string | null;
  };
  session_summaries: {
    id: string;
    observations: string | null;
    strengths: string | null;
    needs_risk_indicators: string | null;
    recommendations_parents: string | null;
    recommendations_school: string | null;
    intervention_plan_home: string | null;
    intervention_plan_school: string | null;
    next_steps: string | null;
    risk_level: string | null;
    report_tier: string | null;
  } | null;
}

export default function SessionReport() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          id, status, started_at, ended_at,
          students (id, full_name, grade, school, risk_level),
          session_summaries (*)
        `)
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        toast.error("Failed to load session");
      } else {
        // Handle the array/object case for nested data
        const processedData = {
          ...data,
          students: Array.isArray(data.students) ? data.students[0] : data.students,
          session_summaries: Array.isArray(data.session_summaries)
            ? data.session_summaries[0] || null
            : data.session_summaries,
        };
        setSession(processedData as SessionData);
      }
      setLoading(false);
    };

    fetchSession();
  }, [sessionId]);

  const handleSaveReport = async (reportData: Record<string, unknown>) => {
    if (!sessionId || !session) return;

    // Upsert session summary
    if (session.session_summaries?.id) {
      // Update existing
      const { error } = await supabase
        .from("session_summaries")
        .update({
          ...reportData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.session_summaries.id);

      if (error) throw error;
    } else {
      // Create new
      const { error } = await supabase
        .from("session_summaries")
        .insert({
          session_id: sessionId,
          ...reportData,
        });

      if (error) throw error;
    }

    // Also update student risk level if provided
    if (reportData.risk_level && session.students?.id) {
      const validRiskLevel = reportData.risk_level as "low" | "moderate" | "high" | "critical";
      await supabase
        .from("students")
        .update({ risk_level: validRiskLevel })
        .eq("id", session.students.id);
    }

    // Refresh data
    const { data } = await supabase
      .from("sessions")
      .select(`
        id, status, started_at, ended_at,
        students (id, full_name, grade, school, risk_level),
        session_summaries (*)
      `)
      .eq("id", sessionId)
      .single();

    if (data) {
      const processedData = {
        ...data,
        students: Array.isArray(data.students) ? data.students[0] : data.students,
        session_summaries: Array.isArray(data.session_summaries)
          ? data.session_summaries[0] || null
          : data.session_summaries,
      };
      setSession(processedData as SessionData);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const student = session.students;
  const summary = session.session_summaries;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Session Report</h1>
          </div>
          <Badge
            variant={session.status === "completed" ? "default" : "secondary"}
            className={
              session.status === "completed"
                ? "bg-success/10 text-success border-success/20"
                : ""
            }
          >
            {session.status === "completed" ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            {session.status}
          </Badge>
        </div>

        {/* Student Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{student?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{student?.grade}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Session Date</p>
                  <p className="font-medium">
                    {new Date(session.started_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {session.ended_at
                      ? `${Math.round(
                          (new Date(session.ended_at).getTime() -
                            new Date(session.started_at).getTime()) /
                            60000
                        )} min`
                      : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Report Generator */}
        <AIReportGenerator
          sessionId={sessionId!}
          existingSummary={summary}
          onSave={handleSaveReport}
        />
      </div>
    </DashboardLayout>
  );
}
