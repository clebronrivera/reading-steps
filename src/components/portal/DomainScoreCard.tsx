import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RiskBadge } from "./RiskBadge";
import { BookOpen, Ear, Zap, MessageSquare, Brain, FileText } from "lucide-react";

interface DomainScoreCardProps {
  domain: string;
  rawScore: number | null;
  maxScore: number | null;
  percentile: number | null;
  riskLevel: "low" | "moderate" | "high" | "critical" | null;
  notes: string | null;
}

const domainConfig: Record<string, { icon: typeof BookOpen; label: string; description: string }> = {
  phonological_awareness: {
    icon: Ear,
    label: "Phonological Awareness",
    description: "Hearing and manipulating sounds in words",
  },
  phonics: {
    icon: BookOpen,
    label: "Phonics",
    description: "Connecting letters to sounds",
  },
  fluency: {
    icon: Zap,
    label: "Reading Fluency",
    description: "Speed, accuracy, and expression",
  },
  vocabulary: {
    icon: MessageSquare,
    label: "Vocabulary",
    description: "Word knowledge and meaning",
  },
  comprehension: {
    icon: Brain,
    label: "Reading Comprehension",
    description: "Understanding what is read",
  },
  print_concepts: {
    icon: FileText,
    label: "Print Concepts",
    description: "Understanding how print works",
  },
};

export function DomainScoreCard({
  domain,
  rawScore,
  maxScore,
  percentile,
  riskLevel,
  notes,
}: DomainScoreCardProps) {
  const config = domainConfig[domain] || {
    icon: BookOpen,
    label: domain,
    description: "",
  };
  const Icon = config.icon;
  const scorePercentage = rawScore && maxScore ? (rawScore / maxScore) * 100 : 0;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{config.label}</CardTitle>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <RiskBadge level={riskLevel} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rawScore !== null && maxScore !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="font-medium">
                {rawScore} / {maxScore}
              </span>
            </div>
            <Progress value={scorePercentage} className="h-2" />
          </div>
        )}
        
        {percentile !== null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Percentile</span>
            <span className="font-medium">{percentile}th</span>
          </div>
        )}

        {notes && (
          <p className="text-sm text-muted-foreground border-t pt-3">{notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
