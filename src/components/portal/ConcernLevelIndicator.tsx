import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "./RiskBadge";
import { AlertTriangle, TrendingUp, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainScore {
  domain: string;
  risk_level: "low" | "moderate" | "high" | "critical" | null;
}

interface ConcernLevelIndicatorProps {
  overallRisk: "low" | "moderate" | "high" | "critical" | null;
  domainScores: DomainScore[];
  recommendations: string | null;
}

const domainLabels: Record<string, string> = {
  phonological_awareness: "Phonological Awareness",
  phonics: "Phonics",
  fluency: "Reading Fluency",
  vocabulary: "Vocabulary",
  comprehension: "Comprehension",
  print_concepts: "Print Concepts",
};

const riskMessages = {
  low: {
    title: "On Track",
    message: "Your child is showing age-appropriate reading skills. Continue supporting their reading development at home.",
    color: "text-success",
    bg: "bg-success/10",
  },
  moderate: {
    title: "Monitor Closely",
    message: "Some areas may benefit from targeted practice. Consider implementing the recommended strategies.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  high: {
    title: "Action Recommended",
    message: "Several areas need attention. We recommend discussing these results with your child's teacher and considering additional support.",
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
  critical: {
    title: "Urgent Action Needed",
    message: "Significant concerns identified. Immediate follow-up with school and potentially a comprehensive evaluation is strongly recommended.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function ConcernLevelIndicator({
  overallRisk,
  domainScores,
  recommendations,
}: ConcernLevelIndicatorProps) {
  const riskInfo = overallRisk ? riskMessages[overallRisk] : null;

  // Get domains with elevated risk
  const concernAreas = domainScores.filter(
    (d) => d.risk_level === "high" || d.risk_level === "critical"
  );

  const monitorAreas = domainScores.filter((d) => d.risk_level === "moderate");

  return (
    <Card className={cn("card-elevated border-2", riskInfo?.bg, "border-transparent")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Assessment
          </CardTitle>
          <RiskBadge level={overallRisk} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Message */}
        {riskInfo && (
          <div className={cn("p-4 rounded-lg", riskInfo.bg)}>
            <h3 className={cn("font-semibold mb-2", riskInfo.color)}>
              {riskInfo.title}
            </h3>
            <p className="text-sm text-foreground">{riskInfo.message}</p>
          </div>
        )}

        {/* Concern Areas */}
        {concernAreas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">Areas of Concern</span>
            </div>
            <div className="grid gap-2">
              {concernAreas.map((area) => (
                <div
                  key={area.domain}
                  className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5 border-destructive/20"
                >
                  <span className="text-sm font-medium">
                    {domainLabels[area.domain] || area.domain}
                  </span>
                  <RiskBadge level={area.risk_level} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitor Areas */}
        {monitorAreas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-warning" />
              <span className="font-medium text-sm">Areas to Monitor</span>
            </div>
            <div className="grid gap-2">
              {monitorAreas.map((area) => (
                <div
                  key={area.domain}
                  className="flex items-center justify-between p-3 rounded-lg border bg-warning/5 border-warning/20"
                >
                  <span className="text-sm font-medium">
                    {domainLabels[area.domain] || area.domain}
                  </span>
                  <RiskBadge level={area.risk_level} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Recommendations */}
        {recommendations && (
          <div className="space-y-3">
            <span className="font-medium text-sm">Key Recommendations</span>
            <div className="space-y-2">
              {recommendations.split("\n").filter(Boolean).slice(0, 3).map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg border bg-primary/5"
                >
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!overallRisk && (
          <div className="text-center text-muted-foreground py-4">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Results will appear here after your screening session.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
