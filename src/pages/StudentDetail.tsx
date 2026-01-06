import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  School, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Play,
  ClipboardList
} from "lucide-react";
import { AssignScalesDialog } from "@/components/dashboard/AssignScalesDialog";
import { GeneratePortalLinkDialog } from "@/components/dashboard/GeneratePortalLinkDialog";
import { AssessmentResultsCard } from "@/components/dashboard/AssessmentResultsCard";

type LeadStatus = "new" | "scheduled" | "completed" | "follow_up_needed" | "converted";
type RiskLevel = "low" | "moderate" | "high" | "critical";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary border-primary/20" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  completed: { label: "Completed", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  follow_up_needed: { label: "Follow-up Needed", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  converted: { label: "Converted", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

const riskConfig: Record<RiskLevel, { label: string; className: string; icon: typeof AlertTriangle }> = {
  low: { label: "Low Risk", className: "bg-green-500/10 text-green-600", icon: CheckCircle },
  moderate: { label: "Moderate Risk", className: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  high: { label: "High Risk", className: "bg-orange-500/10 text-orange-600", icon: AlertTriangle },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [parentScales, setParentScales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    
    // Fetch student with parent and appointments
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select(`
        *,
        parents (full_name, email, phone),
        appointments (id, scheduled_at, status, zoom_join_url, notes)
      `)
      .eq("id", id)
      .single();

    if (!studentError && studentData) {
      setStudent(studentData);
    }

    // Fetch sessions for this student
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("student_id", id)
      .order("created_at", { ascending: false });

    if (!sessionError && sessionData) {
      setSessions(sessionData);
    }

    // Fetch parent scales for this student
    const { data: scalesData, error: scalesError } = await supabase
      .from("parent_scales")
      .select("*")
      .eq("student_id", id);

    if (!scalesError && scalesData) {
      setParentScales(scalesData);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading student details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-muted-foreground">Student not found</div>
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

  const status = student.lead_status as LeadStatus;
  const riskLevel = student.risk_level as RiskLevel | null;
  const RiskIcon = riskLevel ? riskConfig[riskLevel]?.icon : null;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{student.full_name}</h1>
            <p className="text-muted-foreground">
              Grade {student.grade} • {format(new Date(student.date_of_birth), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusConfig[status]?.className}>
            {statusConfig[status]?.label}
          </Badge>
          {riskLevel && RiskIcon && (
            <Badge variant="outline" className={riskConfig[riskLevel]?.className}>
              <RiskIcon className="h-3 w-3 mr-1" />
              {riskConfig[riskLevel]?.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parent/Contact Info */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{student.parents?.full_name || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.parents?.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.parents?.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium">{student.school || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intake Details */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Intake Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Concerns */}
              {student.primary_concerns && student.primary_concerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Concerns</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.primary_concerns.map((concern: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Parent Observations */}
              {student.parent_observations && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Parent Observations</h4>
                  <p className="text-sm whitespace-pre-wrap">{student.parent_observations}</p>
                </div>
              )}

              {/* Languages */}
              {student.languages_at_home && student.languages_at_home.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Languages at Home</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.languages_at_home.map((lang: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* School Supports */}
              {student.school_supports_status && student.school_supports_status.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">School Supports</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.school_supports_status.map((support: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {support}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.current_supports && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Current Supports</h4>
                    <p className="text-sm">{student.current_supports}</p>
                  </div>
                )}
                {student.interventions_tried && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Interventions Tried</h4>
                    <p className="text-sm">{student.interventions_tried}</p>
                  </div>
                )}
                {student.speech_language_history && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Speech/Language History</h4>
                    <p className="text-sm">{student.speech_language_history}</p>
                  </div>
                )}
                {student.vision_hearing_status && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Vision/Hearing Status</h4>
                    <p className="text-sm">{student.vision_hearing_status}</p>
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4 text-sm">
                {student.el_status && (
                  <Badge variant="outline" className="bg-blue-500/10">EL Status</Badge>
                )}
                {student.attendance_concerns && (
                  <Badge variant="outline" className="bg-amber-500/10">Attendance Concerns</Badge>
                )}
              </div>

              {/* Risk Flags */}
              {student.risk_flags && student.risk_flags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Risk Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.risk_flags.map((flag: string, index: number) => (
                      <Badge key={index} variant="destructive" className="bg-destructive/10">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Results */}
          <AssessmentResultsCard studentId={student.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/dashboard/session?studentId=${student.id}`} className="block">
                <Button className="w-full justify-start" variant="default">
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </Link>
              <GeneratePortalLinkDialog
                studentId={student.id}
                studentName={student.full_name}
                parentEmail={student.parents?.email}
              />
              <AssignScalesDialog
                studentId={student.id}
                studentName={student.full_name}
                existingScales={parentScales.map((s: any) => s.scale_type)}
                onAssigned={fetchStudentData}
              />
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.appointments && student.appointments.length > 0 ? (
                <div className="space-y-3">
                  {student.appointments.map((apt: any) => (
                    <div key={apt.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {format(new Date(apt.scheduled_at), "MMM d, yyyy")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(apt.scheduled_at), "h:mm a")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Parent Scales */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Parent Scales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parentScales.length > 0 ? (
                <div className="space-y-3">
                  {parentScales.map((scale: any) => {
                    const scaleNames: Record<string, string> = {
                      seb_brief: "Brief SEB Screener",
                      seb_full: "Full SEB Screener",
                      reading_history: "Reading History",
                      attention_screener: "Attention Screener",
                    };
                    return (
                      <div key={scale.id} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {scaleNames[scale.scale_type] || scale.scale_type}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              scale.completed_at
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                            }
                          >
                            {scale.completed_at ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        {scale.completed_at && (
                          <p className="text-xs text-muted-foreground">
                            Completed {format(new Date(scale.completed_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No scales assigned yet</p>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {format(new Date(session.started_at), "MMM d, yyyy")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {session.status}
                        </Badge>
                      </div>
                      {session.status === "completed" && (
                        <Link to={`/session/${session.id}/report`}>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            View Report
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sessions yet</p>
              )}
            </CardContent>
          </Card>

          {/* Consent Info */}
          <Card className="card-elevated border-0">
            <CardHeader>
              <CardTitle>Consent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                {student.consent_screening ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Screening Consent</span>
              </div>
              <div className="flex items-center gap-2">
                {student.consent_store_data ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Data Storage Consent</span>
              </div>
              <div className="flex items-center gap-2">
                {student.consent_record_zoom ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">Zoom Recording Consent</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
