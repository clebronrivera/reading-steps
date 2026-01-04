import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const concerns = [
  { id: "letter_names", label: "Letter Names (difficulty identifying letters)" },
  { id: "letter_sounds", label: "Letter Sounds (difficulty connecting letters to sounds)" },
  { id: "phonological_awareness", label: "Phonological Awareness (rhyming, syllables, sounds in words)" },
  { id: "decoding", label: "Decoding (sounding out words)" },
  { id: "fluency", label: "Fluency (slow, choppy, or inaccurate reading)" },
  { id: "comprehension", label: "Comprehension (understanding what is read)" },
  { id: "spelling", label: "Spelling difficulties" },
  { id: "other", label: "Other concerns" },
];

const supports = [
  { value: "none", label: "None" },
  { value: "tutoring", label: "Tutoring" },
  { value: "mtss", label: "MTSS/RTI" },
  { value: "iep", label: "IEP" },
  { value: "504", label: "504 Plan" },
];

const grades = [
  "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade",
  "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade",
  "10th Grade", "11th Grade", "12th Grade",
];

const intakeSchema = z.object({
  // Parent info
  parentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  parentEmail: z.string().email("Please enter a valid email").max(255),
  parentPhone: z.string().min(10, "Please enter a valid phone number").max(20),
  // Student info
  studentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  studentDob: z.string().min(1, "Date of birth is required"),
  studentGrade: z.string().min(1, "Grade is required"),
  studentSchool: z.string().max(200).optional(),
  languagesAtHome: z.string().min(1, "Please specify languages spoken"),
  // Concerns
  primaryConcerns: z.array(z.string()).min(1, "Please select at least one concern"),
  currentSupports: z.string().min(1, "Please select current supports"),
  parentObservations: z.string().min(10, "Please describe what you're noticing").max(2000),
  // Consent
  consentScreening: z.boolean().refine(val => val === true, "You must consent to screening"),
  consentStoreData: z.boolean().refine(val => val === true, "You must consent to data storage"),
  consentRecordZoom: z.boolean().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export default function Intake() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      studentName: "",
      studentDob: "",
      studentGrade: "",
      studentSchool: "",
      languagesAtHome: "",
      primaryConcerns: [],
      currentSupports: "",
      parentObservations: "",
      consentScreening: false,
      consentStoreData: false,
      consentRecordZoom: false,
    },
  });

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    try {
      // Create parent
      const { data: parentData, error: parentError } = await supabase
        .from("parents")
        .insert({
          full_name: data.parentName,
          email: data.parentEmail,
          phone: data.parentPhone,
        })
        .select()
        .single();

      if (parentError) throw parentError;

      // Create student
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert({
          parent_id: parentData.id,
          full_name: data.studentName,
          date_of_birth: data.studentDob,
          grade: data.studentGrade,
          school: data.studentSchool || null,
          languages_at_home: data.languagesAtHome.split(",").map(l => l.trim()),
          primary_concerns: data.primaryConcerns,
          current_supports: data.currentSupports,
          parent_observations: data.parentObservations,
          consent_screening: data.consentScreening,
          consent_store_data: data.consentStoreData,
          consent_record_zoom: data.consentRecordZoom || false,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      setStudentId(studentData.id);
      toast({
        title: "Intake form submitted!",
        description: "Now let's schedule your screening session.",
      });
      
      // Navigate to scheduling with student ID
      navigate(`/schedule?studentId=${studentData.id}`);
    } catch (error: any) {
      toast({
        title: "Error submitting form",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof IntakeFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["parentName", "parentEmail", "parentPhone"];
    } else if (step === 2) {
      fieldsToValidate = ["studentName", "studentDob", "studentGrade", "languagesAtHome"];
    } else if (step === 3) {
      fieldsToValidate = ["primaryConcerns", "currentSupports", "parentObservations"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Intake Form</h1>
            <p className="text-muted-foreground">
              Complete this form to schedule your free reading screening session.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    s === step
                      ? "hero-gradient text-primary-foreground"
                      : s < step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-8 md:w-12 h-0.5 ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="card-elevated border-0">
                <CardHeader>
                  <CardTitle>
                    {step === 1 && "Parent/Guardian Information"}
                    {step === 2 && "Student Information"}
                    {step === 3 && "Reading Concerns"}
                    {step === 4 && "Consent & Submit"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Parent Info */}
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Step 2: Student Info */}
                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student's Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Child's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="studentDob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="studentGrade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Grade *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="studentSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Current school" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="languagesAtHome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages Spoken at Home *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., English, Spanish" {...field} />
                            </FormControl>
                            <FormDescription>
                              Separate multiple languages with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Step 3: Concerns */}
                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="primaryConcerns"
                        render={() => (
                          <FormItem>
                            <FormLabel>Primary Concerns *</FormLabel>
                            <FormDescription>
                              Select all areas where you've noticed difficulties
                            </FormDescription>
                            <div className="grid gap-3 mt-2">
                              {concerns.map((concern) => (
                                <FormField
                                  key={concern.id}
                                  control={form.control}
                                  name="primaryConcerns"
                                  render={({ field }) => (
                                    <FormItem className="flex items-start gap-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(concern.id)}
                                          onCheckedChange={(checked) => {
                                            const value = field.value || [];
                                            if (checked) {
                                              field.onChange([...value, concern.id]);
                                            } else {
                                              field.onChange(
                                                value.filter((v) => v !== concern.id)
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <Label className="font-normal cursor-pointer">
                                        {concern.label}
                                      </Label>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentSupports"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Supports *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select current supports" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {supports.map((support) => (
                                  <SelectItem key={support.value} value={support.value}>
                                    {support.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parentObservations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What are you noticing? *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please describe specific observations about your child's reading..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Share any specific examples or patterns you've observed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Step 4: Consent */}
                  {step === 4 && (
                    <>
                      <div className="bg-muted/50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-muted-foreground">
                          Please review the consent statements below. All required consents 
                          must be checked to proceed.
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="consentScreening"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0 p-4 border rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">
                                Consent to Screening *
                              </FormLabel>
                              <FormDescription>
                                I consent to my child participating in this educational 
                                reading screening. I understand this is not a diagnostic 
                                evaluation and does not constitute healthcare.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="consentStoreData"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0 p-4 border rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">
                                Consent to Store Data *
                              </FormLabel>
                              <FormDescription>
                                I consent to the storage of the information provided in 
                                this form and any data collected during the screening 
                                session, as described in the Privacy Policy.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="consentRecordZoom"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0 p-4 border rounded-lg bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">
                                Consent to Record Zoom Session (optional)
                              </FormLabel>
                              <FormDescription>
                                I consent to the Zoom session being recorded for quality 
                                improvement purposes. The recording will not be shared 
                                with third parties.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    ) : (
                      <div />
                    )}
                    {step < 4 ? (
                      <Button type="button" onClick={nextStep}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="hero-gradient border-0 text-primary-foreground"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit & Schedule
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </section>
    </PublicLayout>
  );
}
