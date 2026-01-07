import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit2,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface ComprehensionQuestion {
  id: number;
  question_stem: string;
  options: string[];
  correct_answer: string;
  dok_level: number;
  skill_tag: string;
  answer_relationship: string;
}

interface ComprehensionStimulusData {
  type: string;
  display_mode: string;
  passage_text: string;
  passage_metadata: {
    title: string;
    word_count: number;
    lexile_estimate: string;
    visual_support_description?: string;
  };
  questions: ComprehensionQuestion[];
}

interface TimingConfig {
  passage_read_by?: string;
  reading_timeout_seconds?: number;
  question_timeout_seconds?: number;
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [stimulusData, setStimulusData] = useState<ComprehensionStimulusData | null>(null);
  const [timingConfig, setTimingConfig] = useState<TimingConfig>({});

  const { data: subtest, isLoading } = useQuery({
    queryKey: ["subtest-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtests")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize form when subtest loads
  useEffect(() => {
    if (subtest) {
      setName(subtest.name || "");
      setGrade(subtest.grade || "");
      setScriptPrompt(subtest.script_prompt || "");
      setStimulusData(subtest.stimulus_data as unknown as ComprehensionStimulusData);
      setTimingConfig((subtest.timing_config as unknown as TimingConfig) || {});
    }
  }, [subtest]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("subtests")
        .update({
          name,
          grade,
          script_prompt: scriptPrompt,
          item_count: stimulusData?.questions?.length || subtest?.item_count,
          stimulus_data: stimulusData as unknown as Json,
          timing_config: timingConfig as unknown as Json,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assessment saved successfully");
      queryClient.invalidateQueries({ queryKey: ["subtest-detail", id] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to save assessment");
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subtest) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Assessment not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isComprehension = subtest.module_type === "comprehension";

  const handleSave = () => {
    updateMutation.mutate();
  };

  const handleCancel = () => {
    // Reset to original values
    setName(subtest.name || "");
    setGrade(subtest.grade || "");
    setScriptPrompt(subtest.script_prompt || "");
    setStimulusData(subtest.stimulus_data as unknown as ComprehensionStimulusData);
    setTimingConfig((subtest.timing_config as unknown as TimingConfig) || {});
    setIsEditing(false);
  };

  const updatePassageText = (text: string) => {
    if (!stimulusData) return;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    setStimulusData({
      ...stimulusData,
      passage_text: text,
      passage_metadata: {
        ...stimulusData.passage_metadata,
        word_count: wordCount,
      },
    });
  };

  const updatePassageMetadata = (field: string, value: string) => {
    if (!stimulusData) return;
    setStimulusData({
      ...stimulusData,
      passage_metadata: {
        ...stimulusData.passage_metadata,
        [field]: value,
      },
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    if (!stimulusData) return;
    const questions = [...stimulusData.questions];
    questions[index] = { ...questions[index], [field]: value };
    setStimulusData({
      ...stimulusData,
      questions,
    });
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    if (!stimulusData) return;
    const questions = [...stimulusData.questions];
    const options = [...questions[qIndex].options];
    options[optIndex] = value;
    questions[qIndex] = { ...questions[qIndex], options };
    setStimulusData({
      ...stimulusData,
      questions,
    });
  };

  const addQuestion = () => {
    if (!stimulusData) return;
    const newQuestion: ComprehensionQuestion = {
      id: stimulusData.questions.length + 1,
      question_stem: "",
      options: ["", "", "", ""],
      correct_answer: "A",
      dok_level: 1,
      skill_tag: "Recall",
      answer_relationship: "Explicit",
    };
    setStimulusData({
      ...stimulusData,
      questions: [...stimulusData.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    if (!stimulusData) return;
    const questions = stimulusData.questions.filter((_, i) => i !== index);
    setStimulusData({
      ...stimulusData,
      questions,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl font-bold h-auto py-1"
                />
              ) : (
                <h1 className="text-2xl font-bold">{name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{subtest.module_type}</Badge>
                {grade && <Badge variant="secondary">Grade {grade}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Assessment
              </Button>
            )}
          </div>
        </div>

        {isComprehension && stimulusData ? (
          <Tabs defaultValue="passage" className="space-y-4">
            <TabsList>
              <TabsTrigger value="passage">Passage</TabsTrigger>
              <TabsTrigger value="questions">
                Questions ({stimulusData.questions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Passage Tab */}
            <TabsContent value="passage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Passage Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      {isEditing ? (
                        <Input
                          value={stimulusData.passage_metadata?.title || ""}
                          onChange={(e) => updatePassageMetadata("title", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{stimulusData.passage_metadata?.title}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Lexile Estimate</Label>
                      {isEditing ? (
                        <Input
                          value={stimulusData.passage_metadata?.lexile_estimate || ""}
                          onChange={(e) => updatePassageMetadata("lexile_estimate", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{stimulusData.passage_metadata?.lexile_estimate}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Passage Text</Label>
                      <Badge variant="secondary">
                        {stimulusData.passage_metadata?.word_count || 0} words
                      </Badge>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={stimulusData.passage_text || ""}
                        onChange={(e) => updatePassageText(e.target.value)}
                        rows={12}
                        className="font-serif"
                      />
                    ) : (
                      <div className="p-4 bg-muted rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
                        {stimulusData.passage_text}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Visual Support Description</Label>
                    {isEditing ? (
                      <Textarea
                        value={stimulusData.passage_metadata?.visual_support_description || ""}
                        onChange={(e) => updatePassageMetadata("visual_support_description", e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {stimulusData.passage_metadata?.visual_support_description || "No visual support description"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              {stimulusData.questions?.map((question, qIndex) => (
                <Card key={question.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                        <Badge variant="outline" className="text-xs">DOK {question.dok_level}</Badge>
                        <Badge variant="secondary" className="text-xs">{question.skill_tag}</Badge>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Stem</Label>
                      {isEditing ? (
                        <Textarea
                          value={question.question_stem}
                          onChange={(e) => updateQuestion(qIndex, "question_stem", e.target.value)}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm">{question.question_stem}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {question.options.map((option, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isCorrect = question.correct_answer === letter;
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${
                              isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`font-semibold ${isCorrect ? "text-green-600" : ""}`}>
                                {letter}.
                              </span>
                              {isEditing ? (
                                <Input
                                  value={option}
                                  onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                  className="flex-1"
                                />
                              ) : (
                                <span className="text-sm">{option}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isEditing && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select
                            value={question.correct_answer}
                            onValueChange={(v) => updateQuestion(qIndex, "correct_answer", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>DOK Level</Label>
                          <Select
                            value={String(question.dok_level)}
                            onValueChange={(v) => updateQuestion(qIndex, "dok_level", parseInt(v))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Recall</SelectItem>
                              <SelectItem value="2">2 - Application</SelectItem>
                              <SelectItem value="3">3 - Strategic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Skill Tag</Label>
                          <Input
                            value={question.skill_tag}
                            onChange={(e) => updateQuestion(qIndex, "skill_tag", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {isEditing && (
                <Button variant="outline" className="w-full" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade Level</Label>
                      {isEditing ? (
                        <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
                      ) : (
                        <p className="text-sm">{grade}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Passage Read By</Label>
                      {isEditing ? (
                        <Select
                          value={timingConfig?.passage_read_by || "student"}
                          onValueChange={(v) => setTimingConfig({ ...timingConfig, passage_read_by: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="assessor">Assessor</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm capitalize">{timingConfig?.passage_read_by || "student"}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Script Prompt (Assessor Instructions)</Label>
                    {isEditing ? (
                      <Textarea
                        value={scriptPrompt}
                        onChange={(e) => setScriptPrompt(e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm p-3 bg-muted rounded-lg">{scriptPrompt}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Student View Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{stimulusData.passage_metadata?.title}</h2>
                    </div>
                    <Separator />
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed">{stimulusData.passage_text}</p>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      {stimulusData.questions?.map((q, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <p className="font-medium mb-3">{i + 1}. {q.question_stem}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, j) => (
                              <div key={j} className="p-2 border rounded hover:bg-accent cursor-pointer">
                                {String.fromCharCode(65 + j)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Editor not available for this module type yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
