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
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";

// Grade keys for translation lookup
const gradeKeys = [
  "kindergarten", "1st", "2nd", "3rd", "4th", "5th", 
  "6th", "7th", "8th", "9th", "10th", "11th", "12th"
] as const;

// Concern keys for translation lookup
const concernKeys = [
  { id: "letter_names", key: "letterNames" },
  { id: "letter_sounds", key: "letterSounds" },
  { id: "phonological_awareness", key: "phonological" },
  { id: "decoding", key: "decoding" },
  { id: "fluency", key: "fluency" },
  { id: "comprehension", key: "comprehension" },
  { id: "spelling", key: "spelling" },
  { id: "other", key: "other" },
] as const;

// Support keys for translation lookup
const supportKeys = [
  { id: "none", key: "none" },
  { id: "mtss_rti", key: "mtss" },
  { id: "504", key: "504" },
  { id: "iep", key: "iep" },
  { id: "past_evaluation", key: "pastEval" },
  { id: "tutoring", key: "tutoring" },
] as const;

// Goal keys for translation lookup
const goalKeys = [
  { value: "school_support", key: "schoolSupport" },
  { value: "tutoring_plan", key: "tutoringPlan" },
  { value: "evaluation_guidance", key: "evalGuidance" },
  { value: "full_report", key: "fullReport" },
] as const;

const intakeSchema = z.object({
  // Parent info
  parentName: z.string().min(2).max(100),
  parentEmail: z.string().email().max(255),
  parentPhone: z.string().min(10).max(20),
  // Student info
  studentName: z.string().min(2).max(100),
  studentDob: z.string().min(1),
  studentGrade: z.string().min(1),
  studentSchool: z.string().max(200).optional(),
  languagesAtHome: z.string().min(1),
  // Language/learning context
  elStatus: z.boolean().optional(),
  speechLanguageHistory: z.string().max(1000).optional(),
  visionHearingStatus: z.string().max(500).optional(),
  attendanceConcerns: z.boolean().optional(),
  // Concerns
  primaryConcerns: z.array(z.string()).min(1),
  // School supports
  schoolSupportsStatus: z.array(z.string()).min(1),
  interventionsTried: z.string().max(2000).optional(),
  parentObservations: z.string().min(10).max(2000),
  // Parent goal
  parentGoal: z.string().min(1),
  // Consent
  consentScreening: z.boolean().refine(val => val === true),
  consentStoreData: z.boolean().refine(val => val === true),
  consentRecordZoom: z.boolean().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export default function Intake() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

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
      elStatus: false,
      speechLanguageHistory: "",
      visionHearingStatus: "",
      attendanceConcerns: false,
      primaryConcerns: [],
      schoolSupportsStatus: [],
      interventionsTried: "",
      parentObservations: "",
      parentGoal: "",
      consentScreening: false,
      consentStoreData: false,
      consentRecordZoom: false,
    },
  });

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('public-intake', {
        body: {
          type: 'intake',
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          parentPhone: data.parentPhone,
          studentName: data.studentName,
          studentDob: data.studentDob,
          studentGrade: data.studentGrade,
          studentSchool: data.studentSchool || undefined,
          languagesAtHome: data.languagesAtHome,
          elStatus: data.elStatus,
          speechLanguageHistory: data.speechLanguageHistory,
          visionHearingStatus: data.visionHearingStatus,
          attendanceConcerns: data.attendanceConcerns,
          primaryConcerns: data.primaryConcerns,
          schoolSupportsStatus: data.schoolSupportsStatus,
          interventionsTried: data.interventionsTried,
          parentObservations: data.parentObservations,
          parentGoal: data.parentGoal,
          consentScreening: data.consentScreening,
          consentStoreData: data.consentStoreData,
          consentRecordZoom: data.consentRecordZoom,
          honeypot: honeypot,
          preferredLanguage: language,
        }
      });

      if (error) throw error;
      
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to submit intake form');
      }

      toast({
        title: t.intake.success.title,
        description: t.intake.success.description,
      });
      
      navigate(`/schedule?studentId=${response.studentId}`);
    } catch (error: any) {
      toast({
        title: t.intake.error.title,
        description: error.message || t.intake.error.description,
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
      fieldsToValidate = ["primaryConcerns", "schoolSupportsStatus", "parentObservations", "parentGoal"];
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
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{t.intake.title}</h1>
            <p className="text-muted-foreground">{t.intake.subtitle}</p>
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
                  <div className={`w-8 md:w-12 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="card-elevated border-0">
                <CardHeader>
                  <CardTitle>
                    {step === 1 && t.intake.steps.parentInfo}
                    {step === 2 && t.intake.steps.studentInfo}
                    {step === 3 && t.intake.steps.concerns}
                    {step === 4 && t.intake.steps.consent}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Honeypot field */}
                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input 
                      type="text" 
                      id="website" 
                      name="website" 
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  
                  {/* Step 1: Parent Info */}
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.intake.parent.fullName} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t.intake.parent.fullNamePlaceholder} {...field} />
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
                            <FormLabel>{t.intake.parent.email} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t.intake.parent.emailPlaceholder} {...field} />
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
                            <FormLabel>{t.intake.parent.phone} *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder={t.intake.parent.phonePlaceholder} {...field} />
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
                            <FormLabel>{t.intake.student.fullName} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t.intake.student.fullNamePlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="studentDob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.intake.student.dob} *</FormLabel>
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
                              <FormLabel>{t.intake.student.grade} *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t.intake.student.gradePlaceholder} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {gradeKeys.map((gradeKey) => (
                                    <SelectItem key={gradeKey} value={gradeKey}>
                                      {t.intake.grades[gradeKey]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="studentSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.intake.student.school}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.intake.student.schoolPlaceholder} {...field} />
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
                            <FormLabel>{t.intake.student.languages} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t.intake.student.languagesPlaceholder} {...field} />
                            </FormControl>
                            <FormDescription>{t.intake.student.languagesDescription}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Language/Learning Context Fields */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-4">{t.intake.learningContext.title}</h4>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="elStatus"
                            render={({ field }) => (
                              <FormItem className="flex items-start gap-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div>
                                  <FormLabel className="font-normal">{t.intake.learningContext.elStatus}</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="speechLanguageHistory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.intake.learningContext.speechHistory}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={t.intake.learningContext.speechHistoryPlaceholder}
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>{t.intake.learningContext.speechHistoryDescription}</FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="visionHearingStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.intake.learningContext.visionHearing}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t.intake.learningContext.visionHearingPlaceholder} {...field} />
                                </FormControl>
                                <FormDescription>{t.intake.learningContext.visionHearingDescription}</FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="attendanceConcerns"
                            render={({ field }) => (
                              <FormItem className="flex items-start gap-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div>
                                  <FormLabel className="font-normal">{t.intake.learningContext.attendance}</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Concerns & Goals */}
                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="primaryConcerns"
                        render={() => (
                          <FormItem>
                            <FormLabel>{t.intake.concerns.title} *</FormLabel>
                            <FormDescription>{t.intake.concerns.description}</FormDescription>
                            <div className="grid gap-3 mt-2">
                              {concernKeys.map((concern) => (
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
                                              field.onChange(value.filter((v) => v !== concern.id));
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <Label className="font-normal cursor-pointer">
                                        {t.intake.concerns[concern.key as keyof typeof t.intake.concerns]}
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

                      {/* School Supports Status */}
                      <FormField
                        control={form.control}
                        name="schoolSupportsStatus"
                        render={() => (
                          <FormItem>
                            <FormLabel>{t.intake.supports.title} *</FormLabel>
                            <FormDescription>{t.intake.supports.description}</FormDescription>
                            <div className="grid gap-3 mt-2">
                              {supportKeys.map((support) => (
                                <FormField
                                  key={support.id}
                                  control={form.control}
                                  name="schoolSupportsStatus"
                                  render={({ field }) => (
                                    <FormItem className="flex items-start gap-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(support.id)}
                                          onCheckedChange={(checked) => {
                                            const value = field.value || [];
                                            if (checked) {
                                              if (support.id === "none") {
                                                field.onChange(["none"]);
                                              } else {
                                                const filtered = value.filter(v => v !== "none");
                                                field.onChange([...filtered, support.id]);
                                              }
                                            } else {
                                              field.onChange(value.filter((v) => v !== support.id));
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <Label className="font-normal cursor-pointer">
                                        {t.intake.supports[support.key as keyof typeof t.intake.supports]}
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
                        name="interventionsTried"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.intake.observations.interventions}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t.intake.observations.interventionsPlaceholder}
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>{t.intake.observations.interventionsDescription}</FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentObservations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.intake.observations.parentObs} *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t.intake.observations.parentObsPlaceholder}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>{t.intake.observations.parentObsDescription}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Parent Goal Selection */}
                      <FormField
                        control={form.control}
                        name="parentGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.intake.goal.title} *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t.intake.goal.title} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {goalKeys.map((goal) => (
                                  <SelectItem key={goal.value} value={goal.value}>
                                    {t.intake.goal[goal.key as keyof typeof t.intake.goal]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                          {language === 'en' && "Please review the consent statements below. All required consents must be checked to proceed."}
                          {language === 'es' && "Por favor revise las declaraciones de consentimiento a continuación. Todos los consentimientos requeridos deben estar marcados para continuar."}
                          {language === 'pt' && "Por favor, revise as declarações de consentimento abaixo. Todos os consentimentos obrigatórios devem ser marcados para continuar."}
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="consentScreening"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 space-y-0 p-4 border rounded-lg">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">{t.intake.consent.screeningTitle} *</FormLabel>
                              <FormDescription>{t.intake.consent.screeningText}</FormDescription>
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
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">{t.intake.consent.dataTitle} *</FormLabel>
                              <FormDescription>{t.intake.consent.dataText}</FormDescription>
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
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium">{t.intake.consent.recordTitle}</FormLabel>
                              <FormDescription>{t.intake.consent.recordText}</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Parent Presence Requirement */}
                      <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                        <p className="text-sm font-medium text-primary mb-2">📋 {language === 'en' ? 'Session Requirement' : language === 'es' ? 'Requisito de la Sesión' : 'Requisito da Sessão'}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'en' && "A parent/guardian must be present for the full 30-minute session. Please ensure you have a quiet space with minimal distractions and that your camera shows your child clearly."}
                          {language === 'es' && "Un padre/tutor debe estar presente durante toda la sesión de 30 minutos. Asegúrese de tener un espacio tranquilo con mínimas distracciones y que su cámara muestre claramente a su hijo/a."}
                          {language === 'pt' && "Um pai/responsável deve estar presente durante toda a sessão de 30 minutos. Certifique-se de ter um espaço tranquilo com mínimas distrações e que sua câmera mostre seu filho(a) claramente."}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t.intake.buttons.back}
                      </Button>
                    ) : (
                      <div />
                    )}
                    {step < 4 ? (
                      <Button type="button" onClick={nextStep}>
                        {t.intake.buttons.next}
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
                            {t.intake.buttons.submitting}
                          </>
                        ) : (
                          <>
                            {t.intake.buttons.submit}
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
