import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Lock, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface SessionSummary {
  report_tier: "free" | "paid" | null;
  unlocked_at: string | null;
  observations: string | null;
  strengths: string | null;
  recommendations_parents: string | null;
  next_steps: string | null;
}

interface ReportStatusCardProps {
  sessionStatus: string;
  summary: SessionSummary | null;
  onDownload: () => void;
  onUpgrade: () => void;
}

export function ReportStatusCard({
  sessionStatus,
  summary,
  onDownload,
  onUpgrade,
}: ReportStatusCardProps) {
  const isCompleted = sessionStatus === "completed";
  const hasSummary = summary !== null;
  const isPaid = summary?.report_tier === "paid";

  // Calculate completion percentage based on available fields
  const completionSteps = [
    { label: "Screening session", done: isCompleted },
    { label: "Results analyzed", done: hasSummary },
    { label: "Observations recorded", done: !!summary?.observations },
    { label: "Recommendations ready", done: !!summary?.recommendations_parents },
    { label: "Next steps defined", done: !!summary?.next_steps },
  ];

  const completedSteps = completionSteps.filter((s) => s.done).length;
  const completionPercentage = (completedSteps / completionSteps.length) * 100;

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Status
          </CardTitle>
          <Badge
            variant={completionPercentage === 100 ? "default" : "secondary"}
            className={
              completionPercentage === 100
                ? "bg-success/10 text-success border-success/20"
                : ""
            }
          >
            {completionPercentage === 100 ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                In Progress
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Report completion</span>
            <span className="font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {completionSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              {step.done ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted" />
              )}
              <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Report Tier Info */}
        {hasSummary && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Report Type</span>
              <Badge variant={isPaid ? "default" : "secondary"}>
                {isPaid ? "Full Report" : "Free Summary"}
              </Badge>
            </div>

            {!isPaid && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <p>
                    Your free report includes basic results. Upgrade to unlock detailed 
                    intervention plans, school advocacy guidance, and comprehensive recommendations.
                  </p>
                </div>
                <Button onClick={onUpgrade} className="w-full" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Full Report
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Download Button */}
        {completionPercentage === 100 && (
          <Button onClick={onDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Report (PDF)
          </Button>
        )}

        {!isCompleted && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-muted-foreground">
              Your report will be available after the screening session is completed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
