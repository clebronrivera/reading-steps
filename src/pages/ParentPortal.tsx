import { useSearchParams, Link } from "react-router-dom";
import { usePortalData } from "@/hooks/usePortalData";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DomainScoreCard } from "@/components/portal/DomainScoreCard";
import { NextStepsChecklist } from "@/components/portal/NextStepsChecklist";
import { TeacherInputRequest } from "@/components/portal/TeacherInputRequest";
import { ParentScalesForm } from "@/components/portal/ParentScalesForm";
import { ReportStatusCard } from "@/components/portal/ReportStatusCard";
import { ConcernLevelIndicator } from "@/components/portal/ConcernLevelIndicator";
import { RiskBadge } from "@/components/portal/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Building,
  BarChart3,
  ClipboardList,
  School,
  FileText,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";

export default function ParentPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const {
    data,
    loading,
    error,
    isValid,
    updateChecklist,
    submitScale,
    requestTeacherInput,
  } = usePortalData(token);

  const handleDownloadReport = () => {
    if (!data?.student || !data?.session?.session_summaries) {
      toast.error("Report not available yet");
      return;
    }

    const summary = data.session.session_summaries;
    const student = data.student;

    // Generate PDF
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Reading Screening Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Student: ${student.full_name}`, 20, 35);
    doc.text(`Grade: ${student.grade}`, 20, 43);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 51);
    
    if (summary.risk_level) {
      doc.text(`Overall Risk Level: ${summary.risk_level.toUpperCase()}`, 20, 63);
    }

    let yPos = 78;

    if (summary.observations) {
      doc.setFontSize(14);
      doc.text("Observations", 20, yPos);
      doc.setFontSize(10);
      yPos += 8;
      const obsLines = doc.splitTextToSize(summary.observations, 170);
      doc.text(obsLines, 20, yPos);
      yPos += obsLines.length * 5 + 10;
    }

    if (summary.strengths) {
      doc.setFontSize(14);
      doc.text("Strengths", 20, yPos);
      doc.setFontSize(10);
      yPos += 8;
      const strengthLines = doc.splitTextToSize(summary.strengths, 170);
      doc.text(strengthLines, 20, yPos);
      yPos += strengthLines.length * 5 + 10;
    }

    if (summary.recommendations_parents) {
      doc.setFontSize(14);
      doc.text("Recommendations", 20, yPos);
      doc.setFontSize(10);
      yPos += 8;
      const recLines = doc.splitTextToSize(summary.recommendations_parents, 170);
      doc.text(recLines, 20, yPos);
      yPos += recLines.length * 5 + 10;
    }

    if (summary.next_steps) {
      doc.setFontSize(14);
      doc.text("Next Steps", 20, yPos);
      doc.setFontSize(10);
      yPos += 8;
      const nextLines = doc.splitTextToSize(summary.next_steps, 170);
      doc.text(nextLines, 20, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      "This is an educational screening report, not a clinical diagnosis.",
      20,
      285
    );

    doc.save(`${student.full_name.replace(/\s+/g, "_")}_Reading_Report.pdf`);
    toast.success("Report downloaded successfully");
  };

  const handleUpgradeReport = () => {
    toast.info("Report upgrade coming soon!");
  };

  // Loading state
  if (loading) {
    return (
      <PublicLayout>
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Error state
  if (error || !isValid) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Invalid or expired access link. Please request a new one."}
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const student = data?.student;
  const session = data?.session;
  const summary = session?.session_summaries;

  return (
    <PublicLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {student?.full_name}'s Parent Portal
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Grade {student?.grade}
                </span>
                {student?.school && (
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {student.school}
                  </span>
                )}
              </div>
            </div>
            {student?.risk_level && (
              <RiskBadge level={student.risk_level} size="lg" />
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="results" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Next Steps</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-1">
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">Teacher</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Concern Level Indicator */}
              <div className="lg:col-span-2">
                <ConcernLevelIndicator
                  overallRisk={student?.risk_level || null}
                  domainScores={data?.domainScores || []}
                  recommendations={summary?.recommendations_parents || null}
                />
              </div>

              {/* Report Status */}
              <div>
                <ReportStatusCard
                  sessionStatus={session?.status || "scheduled"}
                  summary={summary || null}
                  onDownload={handleDownloadReport}
                  onUpgrade={handleUpgradeReport}
                />
              </div>
            </div>

            {/* Domain Scores */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Domain Scores</h2>
              {data?.domainScores && data.domainScores.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.domainScores.map((score) => (
                    <DomainScoreCard
                      key={score.id}
                      domain={score.domain}
                      rawScore={score.raw_score}
                      maxScore={score.max_score}
                      percentile={score.percentile}
                      riskLevel={score.risk_level}
                      notes={score.notes}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Domain scores will appear here after your screening session.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Card */}
            {summary && (
              <div className="grid gap-6 lg:grid-cols-2">
                {summary.strengths && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Strengths Observed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {summary.strengths}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {summary.observations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Observations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {summary.observations}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <NextStepsChecklist
                items={data?.checklistItems || []}
                onToggle={updateChecklist}
              />
              <ParentScalesForm
                completedScales={data?.parentScales || []}
                onSubmit={submitScale}
              />
            </div>
          </TabsContent>

          {/* Teacher Tab */}
          <TabsContent value="teacher" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <TeacherInputRequest
                studentName={student?.full_name || ""}
                existingRequests={data?.teacherRequests || []}
                onSubmit={requestTeacherInput}
              />

              {/* Records Request Generator */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    School Records Request
                  </CardTitle>
                  <CardDescription>
                    Generate a formal letter requesting educational records from school.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Under FERPA, you have the right to access your child's educational records.
                    This includes report cards, standardized test scores, IEP/504 documents,
                    and progress monitoring data.
                  </p>
                  <div className="p-4 rounded-lg border bg-muted/30 text-sm">
                    <p className="font-medium mb-2">Sample Letter Content:</p>
                    <p className="text-muted-foreground italic">
                      "Dear [School Administrator],
                      <br /><br />
                      I am writing to request copies of all educational records for my child,
                      {student?.full_name}, Grade {student?.grade}. Under the Family Educational
                      Rights and Privacy Act (FERPA), I am entitled to access these records.
                      <br /><br />
                      Specifically, I am requesting..."
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const recordsLetter = `Dear [School Administrator],

I am writing to request copies of all educational records for my child, ${student?.full_name}, currently in Grade ${student?.grade}${student?.school ? ` at ${student.school}` : ""}.

Under the Family Educational Rights and Privacy Act (FERPA), I am entitled to access these records within 45 days of this request.

I am specifically requesting:
- Cumulative academic file
- All standardized test scores and assessments
- Any intervention documentation
- Progress monitoring data
- Report cards and progress reports
- Any IEP, 504, or RTI documentation if applicable
- Teacher observations and notes

Please contact me to arrange pickup or mailing of these records.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Name]
[Your Phone]
[Your Email]
[Date]`;

                      navigator.clipboard.writeText(recordsLetter);
                      toast.success("Records request letter copied to clipboard");
                    }}
                  >
                    Copy Records Request Letter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Full Report Preview */}
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle>Report Preview</CardTitle>
                    <CardDescription>
                      Download your complete screening report below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {summary ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Observations</h4>
                            <p className="text-sm text-muted-foreground">
                              {summary.observations || "No observations recorded yet."}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Strengths</h4>
                            <p className="text-sm text-muted-foreground">
                              {summary.strengths || "Strengths will be documented here."}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {summary.recommendations_parents || "Recommendations will appear here."}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Next Steps</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {summary.next_steps || "Next steps will be provided here."}
                            </p>
                          </div>
                        </div>
                        <Button onClick={handleDownloadReport} className="w-full">
                          Download Full Report (PDF)
                        </Button>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Your report will be available after the screening is completed.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <ReportStatusCard
                  sessionStatus={session?.status || "scheduled"}
                  summary={summary || null}
                  onDownload={handleDownloadReport}
                  onUpgrade={handleUpgradeReport}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
