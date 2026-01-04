import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Home,
  School,
  ArrowRight,
} from "lucide-react";

interface AIReport {
  risk_level: "low" | "moderate" | "high" | "critical";
  observations: string;
  strengths: string;
  needs_risk_indicators: string;
  recommendations_parents: string;
  recommendations_school: string;
  intervention_plan_home: string;
  intervention_plan_school: string;
  next_steps: string;
}

interface AIReportGeneratorProps {
  sessionId: string;
  existingSummary?: {
    observations?: string;
    strengths?: string;
    needs_risk_indicators?: string;
    recommendations_parents?: string;
    recommendations_school?: string;
    intervention_plan_home?: string;
    intervention_plan_school?: string;
    next_steps?: string;
    risk_level?: string;
  } | null;
  onSave: (data: Partial<AIReport>) => Promise<void>;
}

const riskColors = {
  low: "bg-success/10 text-success border-success/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AIReportGenerator({
  sessionId,
  existingSummary,
  onSave,
}: AIReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [editedReport, setEditedReport] = useState<Partial<AIReport>>({});

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { sessionId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setReport(data.report);
      setEditedReport(data.report);
      toast.success("AI report generated successfully!");
    } catch (err) {
      console.error("Report generation error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedReport);
      toast.success("Report saved successfully!");
    } catch (err) {
      toast.error("Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AIReport, value: string) => {
    setEditedReport((prev) => ({ ...prev, [field]: value }));
  };

  const currentReport = editedReport.observations ? editedReport : existingSummary;

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Report Generator
            </CardTitle>
            <CardDescription>
              Generate or edit session summary using AI analysis
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : report ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            {currentReport && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Report
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!currentReport && !isGenerating && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Report Generated Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Generate Report" to analyze session responses and create
              observations, recommendations, and intervention plans.
            </p>
            <Button onClick={generateReport} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Report
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="font-medium mb-2">Analyzing Session Data...</h3>
            <p className="text-sm text-muted-foreground">
              AI is reviewing response patterns and generating recommendations.
            </p>
          </div>
        )}

        {currentReport && !isGenerating && (
          <div className="space-y-6">
            {/* Risk Level Badge */}
            {editedReport.risk_level && (
              <div className="flex items-center gap-3">
                <Label>Risk Level</Label>
                <Badge
                  className={riskColors[editedReport.risk_level as keyof typeof riskColors]}
                >
                  {editedReport.risk_level === "low" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {(editedReport.risk_level === "high" || editedReport.risk_level === "critical") && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {editedReport.risk_level.charAt(0).toUpperCase() + editedReport.risk_level.slice(1)} Risk
                </Badge>
              </div>
            )}

            <Tabs defaultValue="observations" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="observations">
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Observations</span>
                </TabsTrigger>
                <TabsTrigger value="home">
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>
                <TabsTrigger value="school">
                  <School className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">School</span>
                </TabsTrigger>
                <TabsTrigger value="next">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Next Steps</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px]">
                <TabsContent value="observations" className="space-y-4 pr-4">
                  <div className="space-y-2">
                    <Label>Session Observations</Label>
                    <Textarea
                      value={editedReport.observations || ""}
                      onChange={(e) => updateField("observations", e.target.value)}
                      rows={4}
                      placeholder="Observations about the session..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strengths Observed</Label>
                    <Textarea
                      value={editedReport.strengths || ""}
                      onChange={(e) => updateField("strengths", e.target.value)}
                      rows={4}
                      placeholder="Student's strengths..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Areas of Concern / Risk Indicators</Label>
                    <Textarea
                      value={editedReport.needs_risk_indicators || ""}
                      onChange={(e) => updateField("needs_risk_indicators", e.target.value)}
                      rows={4}
                      placeholder="Areas needing attention..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="home" className="space-y-4 pr-4">
                  <div className="space-y-2">
                    <Label>Recommendations for Parents</Label>
                    <Textarea
                      value={editedReport.recommendations_parents || ""}
                      onChange={(e) => updateField("recommendations_parents", e.target.value)}
                      rows={6}
                      placeholder="Recommendations for parents..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Home Intervention Plan</Label>
                    <Textarea
                      value={editedReport.intervention_plan_home || ""}
                      onChange={(e) => updateField("intervention_plan_home", e.target.value)}
                      rows={6}
                      placeholder="Specific activities for home practice..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="school" className="space-y-4 pr-4">
                  <div className="space-y-2">
                    <Label>Recommendations for School</Label>
                    <Textarea
                      value={editedReport.recommendations_school || ""}
                      onChange={(e) => updateField("recommendations_school", e.target.value)}
                      rows={6}
                      placeholder="Recommendations to share with school..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>School Intervention Plan</Label>
                    <Textarea
                      value={editedReport.intervention_plan_school || ""}
                      onChange={(e) => updateField("intervention_plan_school", e.target.value)}
                      rows={6}
                      placeholder="Suggested school-based interventions..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="next" className="space-y-4 pr-4">
                  <div className="space-y-2">
                    <Label>Next Steps</Label>
                    <Textarea
                      value={editedReport.next_steps || ""}
                      onChange={(e) => updateField("next_steps", e.target.value)}
                      rows={8}
                      placeholder="Priority action items..."
                    />
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
