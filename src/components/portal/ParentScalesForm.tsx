import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ParentScale {
  id: string;
  scale_type: string;
  completed_at: string | null;
}

interface ParentScalesFormProps {
  completedScales: ParentScale[];
  onSubmit: (scaleType: string, responses: Record<string, unknown>) => Promise<void>;
}

const scales = {
  reading_history: {
    title: "Family Reading History",
    description: "Help us understand reading patterns in your family",
    questions: [
      {
        id: "parent_reading_difficulty",
        question: "Did either parent experience reading difficulties as a child?",
        type: "choice",
        options: ["Yes, mother", "Yes, father", "Yes, both", "No", "Unknown"],
      },
      {
        id: "sibling_reading_difficulty",
        question: "Do any siblings have reading difficulties?",
        type: "choice",
        options: ["Yes", "No", "No siblings", "Unknown"],
      },
      {
        id: "family_history_dyslexia",
        question: "Is there a family history of dyslexia or learning disabilities?",
        type: "choice",
        options: ["Yes", "No", "Unknown"],
      },
      {
        id: "additional_history",
        question: "Any additional information about family reading history?",
        type: "text",
      },
    ],
  },
  home_literacy: {
    title: "Home Literacy Environment",
    description: "Tell us about reading activities at home",
    questions: [
      {
        id: "books_at_home",
        question: "Approximately how many children's books are in your home?",
        type: "choice",
        options: ["0-10", "11-25", "26-50", "51-100", "More than 100"],
      },
      {
        id: "reading_frequency",
        question: "How often do you read to or with your child?",
        type: "choice",
        options: ["Daily", "Several times a week", "Once a week", "Occasionally", "Rarely"],
      },
      {
        id: "child_enjoys_reading",
        question: "Does your child enjoy reading activities?",
        type: "choice",
        options: ["Very much", "Somewhat", "Neutral", "Not really", "Avoids reading"],
      },
      {
        id: "library_visits",
        question: "How often do you visit the library?",
        type: "choice",
        options: ["Weekly", "Monthly", "Occasionally", "Rarely", "Never"],
      },
    ],
  },
  behavior_checklist: {
    title: "Reading Behavior Observations",
    description: "Share what you've noticed about your child's reading",
    questions: [
      {
        id: "avoids_reading",
        question: "Does your child avoid reading tasks?",
        type: "choice",
        options: ["Never", "Sometimes", "Often", "Always"],
      },
      {
        id: "frustration_level",
        question: "Does your child show frustration when reading?",
        type: "choice",
        options: ["Never", "Sometimes", "Often", "Always"],
      },
      {
        id: "guesses_words",
        question: "Does your child guess at words rather than sound them out?",
        type: "choice",
        options: ["Never", "Sometimes", "Often", "Always"],
      },
      {
        id: "loses_place",
        question: "Does your child lose their place while reading?",
        type: "choice",
        options: ["Never", "Sometimes", "Often", "Always"],
      },
      {
        id: "comprehension_struggles",
        question: "Does your child struggle to remember or understand what they read?",
        type: "choice",
        options: ["Never", "Sometimes", "Often", "Always"],
      },
    ],
  },
  developmental_milestones: {
    title: "Developmental Milestones",
    description: "Help us understand early development",
    questions: [
      {
        id: "speech_delay",
        question: "Did your child experience speech or language delays?",
        type: "choice",
        options: ["Yes", "No", "Unsure"],
      },
      {
        id: "speech_therapy",
        question: "Has your child received speech-language therapy?",
        type: "choice",
        options: ["Yes, currently", "Yes, in the past", "No"],
      },
      {
        id: "ear_infections",
        question: "Did your child have frequent ear infections in early childhood?",
        type: "choice",
        options: ["Yes", "No", "Unsure"],
      },
      {
        id: "preschool_concerns",
        question: "Were there any concerns about reading readiness in preschool/kindergarten?",
        type: "choice",
        options: ["Yes", "No", "Did not attend"],
      },
    ],
  },
};

export function ParentScalesForm({ completedScales, onSubmit }: ParentScalesFormProps) {
  const [activeScale, setActiveScale] = useState<string>("reading_history");
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isScaleCompleted = (scaleType: string) =>
    completedScales.some((s) => s.scale_type === scaleType);

  const handleResponseChange = (scaleType: string, questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [scaleType]: {
        ...(prev[scaleType] || {}),
        [questionId]: value,
      },
    }));
  };

  const handleSubmit = async (scaleType: string) => {
    const scaleResponses = responses[scaleType];
    const scale = scales[scaleType as keyof typeof scales];

    const requiredQuestions = scale.questions.filter((q) => q.type === "choice");
    const answeredQuestions = Object.keys(scaleResponses || {});

    if (requiredQuestions.some((q) => !answeredQuestions.includes(q.id))) {
      toast.error("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(scaleType, scaleResponses);
      toast.success(`${scale.title} submitted successfully`);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Additional Questionnaires
        </CardTitle>
        <CardDescription>
          Complete these optional questionnaires to provide more context for the screening.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScale} onValueChange={setActiveScale}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
            {Object.entries(scales).map(([key, scale]) => (
              <TabsTrigger key={key} value={key} className="relative">
                <span className="truncate">{scale.title.split(" ")[0]}</span>
                {isScaleCompleted(key) && (
                  <CheckCircle className="h-3 w-3 text-success absolute -top-1 -right-1" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(scales).map(([key, scale]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{scale.title}</h3>
                  <p className="text-sm text-muted-foreground">{scale.description}</p>
                </div>
                {isScaleCompleted(key) ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Not Started
                  </Badge>
                )}
              </div>

              {!isScaleCompleted(key) && (
                <>
                  <div className="space-y-6">
                    {scale.questions.map((q) => (
                      <div key={q.id} className="space-y-3">
                        <Label className="text-sm font-medium">{q.question}</Label>
                        {q.type === "choice" ? (
                          <RadioGroup
                            value={responses[key]?.[q.id] || ""}
                            onValueChange={(value) =>
                              handleResponseChange(key, q.id, value)
                            }
                            className="flex flex-wrap gap-3"
                          >
                            {q.options?.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                                <Label
                                  htmlFor={`${q.id}-${option}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <Textarea
                            value={responses[key]?.[q.id] || ""}
                            onChange={(e) =>
                              handleResponseChange(key, q.id, e.target.value)
                            }
                            placeholder="Enter your response..."
                            rows={3}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubmit(key)}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : `Submit ${scale.title}`}
                  </Button>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
