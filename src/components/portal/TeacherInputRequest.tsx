import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { School, Mail, Copy, CheckCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";

interface TeacherRequest {
  id: string;
  teacher_email: string | null;
  teacher_name: string | null;
  status: "pending" | "sent" | "completed";
}

interface TeacherInputRequestProps {
  studentName: string;
  existingRequests: TeacherRequest[];
  onSubmit: (email: string, name: string, questions: string[]) => Promise<void>;
}

const commonQuestions = [
  "How does the student perform in reading compared to grade-level peers?",
  "Does the student struggle with decoding unfamiliar words?",
  "How is the student's reading fluency (speed and accuracy)?",
  "Does the student have difficulty understanding what they read?",
  "Are there any attention or behavior concerns during reading instruction?",
  "Has the student received any reading interventions? If so, what was the response?",
  "Does the student have an IEP, 504, or receive special education services?",
  "Are there concerns about the student's writing or spelling?",
];

export function TeacherInputRequest({
  studentName,
  existingRequests,
  onSubmit,
}: TeacherInputRequestProps) {
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleQuestionToggle = (question: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const handleSubmit = async () => {
    if (!teacherEmail || !teacherName || selectedQuestions.length === 0) {
      toast.error("Please fill in teacher details and select at least one question");
      return;
    }

    setIsSubmitting(true);
    try {
      const questions = customQuestion
        ? [...selectedQuestions, customQuestion]
        : selectedQuestions;
      await onSubmit(teacherEmail, teacherName, questions);
      toast.success("Teacher input request created successfully");
      setTeacherEmail("");
      setTeacherName("");
      setSelectedQuestions([]);
      setCustomQuestion("");
    } catch {
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateEmailContent = () => {
    const questions = customQuestion
      ? [...selectedQuestions, customQuestion]
      : selectedQuestions;

    return `Dear ${teacherName},

I am writing to request information about ${studentName}'s reading development. This information will help inform an educational reading screening to better understand ${studentName}'s needs.

Please respond to the following questions when you have a moment:

${questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n")}

Thank you for your time and support in helping ${studentName} succeed.

Best regards,
${studentName}'s Parent/Guardian`;
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(generateEmailContent());
    toast.success("Email content copied to clipboard");
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          Request Teacher Input
        </CardTitle>
        <CardDescription>
          Don't have answers to certain questions? Request input from {studentName}'s teacher.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Requests */}
        {existingRequests.length > 0 && (
          <div className="space-y-2">
            <Label>Previous Requests</Label>
            {existingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{req.teacher_email}</span>
                </div>
                <Badge
                  variant={req.status === "completed" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {req.status === "completed" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Teacher Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="teacherName">Teacher's Name</Label>
            <Input
              id="teacherName"
              placeholder="Ms. Smith"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacherEmail">Teacher's Email</Label>
            <Input
              id="teacherEmail"
              type="email"
              placeholder="teacher@school.edu"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Questions Selection */}
        <div className="space-y-3">
          <Label>Select Questions for Teacher</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {commonQuestions.map((question) => (
              <div
                key={question}
                className="flex items-start gap-3 p-2 rounded hover:bg-muted/50"
              >
                <Checkbox
                  id={question}
                  checked={selectedQuestions.includes(question)}
                  onCheckedChange={() => handleQuestionToggle(question)}
                />
                <label
                  htmlFor={question}
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  {question}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Question */}
        <div className="space-y-2">
          <Label htmlFor="customQuestion">Additional Question (Optional)</Label>
          <Textarea
            id="customQuestion"
            placeholder="Add your own question..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            rows={2}
          />
        </div>

        {/* Email Preview */}
        {showEmailPreview && selectedQuestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Email Preview</Label>
              <Button variant="ghost" size="sm" onClick={copyEmailToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
              {generateEmailContent()}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            disabled={selectedQuestions.length === 0}
          >
            {showEmailPreview ? "Hide" : "Preview"} Email
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Sending..." : "Create Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
