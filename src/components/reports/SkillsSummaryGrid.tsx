import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtestScore {
  subtestId: string;
  subtestName: string;
  moduleType: string;
  itemCount: number;
  totalItems: number;
  correctCount: number;
  errorCount: number;
  percentCorrect: number;
  needsInstruction: boolean;
  skipped: boolean;
}

interface SkillsSummaryGridProps {
  sessionId: string;
}

// Thresholds for "NEEDS INSTRUCTION" flags
const getInstructionalFlag = (itemCount: number, errorCount: number): boolean => {
  // 5-item subtest with 2+ errors
  if (itemCount <= 5 && errorCount >= 2) return true;
  // 10-item subtest with 3+ errors
  if (itemCount > 5 && itemCount <= 10 && errorCount >= 3) return true;
  // Larger subtests: more than 30% errors
  if (itemCount > 10 && errorCount / itemCount >= 0.3) return true;
  return false;
};

export function SkillsSummaryGrid({ sessionId }: SkillsSummaryGridProps) {
  const [scores, setScores] = useState<SubtestScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        // Get all responses for this session grouped by subtest
        const { data: responses, error: respError } = await supabase
          .from("responses")
          .select(`
            subtest_id,
            score_code,
            subtests (id, name, module_type, item_count)
          `)
          .eq("session_id", sessionId);

        if (respError) throw respError;

        // Get all subtests that were part of this session (via current_subtest tracking)
        const { data: sessionData } = await supabase
          .from("sessions")
          .select("current_subtest_id")
          .eq("id", sessionId)
          .single();

        // Group responses by subtest
        const subtestMap = new Map<string, {
          name: string;
          moduleType: string;
          itemCount: number;
          correct: number;
          incorrect: number;
          total: number;
        }>();

        responses?.forEach((resp) => {
          const subtest = resp.subtests as unknown as {
            id: string;
            name: string;
            module_type: string;
            item_count: number;
          };
          
          if (!subtest) return;

          const existing = subtestMap.get(subtest.id) || {
            name: subtest.name,
            moduleType: subtest.module_type || "unknown",
            itemCount: subtest.item_count || 0,
            correct: 0,
            incorrect: 0,
            total: 0,
          };

          existing.total++;
          if (resp.score_code === "correct" || resp.score_code === "self_correct") {
            existing.correct++;
          } else {
            existing.incorrect++;
          }

          subtestMap.set(subtest.id, existing);
        });

        // Convert to array with calculated fields
        const scoreArray: SubtestScore[] = Array.from(subtestMap.entries()).map(
          ([id, data]) => ({
            subtestId: id,
            subtestName: data.name,
            moduleType: data.moduleType,
            itemCount: data.itemCount,
            totalItems: data.total,
            correctCount: data.correct,
            errorCount: data.incorrect,
            percentCorrect: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            needsInstruction: getInstructionalFlag(data.itemCount || data.total, data.incorrect),
            skipped: data.total === 0,
          })
        );

        // Sort by module type for grouping
        scoreArray.sort((a, b) => a.subtestName.localeCompare(b.subtestName));

        setScores(scoreArray);
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [sessionId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No scored responses recorded for this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by category/module type
  const groupedScores = scores.reduce((acc, score) => {
    const category = getCategoryFromName(score.subtestName);
    if (!acc[category]) acc[category] = [];
    acc[category].push(score);
    return acc;
  }, {} as Record<string, SubtestScore[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Skills Summary Report</span>
          <div className="flex gap-2 text-sm font-normal">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Instruction
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              On Track
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedScores).map(([category, categoryScores]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="grid gap-2">
                {categoryScores.map((score) => (
                  <div
                    key={score.subtestId}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      score.needsInstruction
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-muted/30 border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {score.needsInstruction ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : score.skipped ? (
                        <MinusCircle className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      <div>
                        <p className="font-medium">{score.subtestName}</p>
                        <p className="text-xs text-muted-foreground">
                          {score.totalItems} items attempted
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={cn(
                          "font-bold text-lg",
                          score.needsInstruction ? "text-destructive" : "text-foreground"
                        )}>
                          {score.correctCount}/{score.totalItems}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {score.percentCorrect}% correct
                        </p>
                      </div>
                      {score.needsInstruction && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          NEEDS INSTRUCTION
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{scores.length}</p>
              <p className="text-xs text-muted-foreground">Subtests Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {scores.filter((s) => !s.needsInstruction && !s.skipped).length}
              </p>
              <p className="text-xs text-muted-foreground">On Track</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {scores.filter((s) => s.needsInstruction).length}
              </p>
              <p className="text-xs text-muted-foreground">Need Instruction</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to categorize subtests by name patterns
function getCategoryFromName(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("alphabet") || lowerName.includes("letter")) return "Alphabet Skills";
  if (lowerName.includes("consonant") || lowerName.includes("vowel")) return "Letter Sounds";
  if (lowerName.includes("reading") || lowerName.includes("decoding")) return "Reading & Decoding";
  if (lowerName.includes("spelling")) return "Spelling";
  if (lowerName.includes("orf") || lowerName.includes("fluency")) return "Oral Reading Fluency";
  if (lowerName.includes("phonological") || lowerName.includes("awareness")) return "Phonological Awareness";
  if (lowerName.includes("comprehension")) return "Comprehension";
  return "Other Skills";
}
