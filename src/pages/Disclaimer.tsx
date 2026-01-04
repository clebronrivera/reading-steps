import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function Disclaimer() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-6">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Screening Disclaimer
              </h1>
              <p className="text-xl text-muted-foreground">
                Important information about what this service is and is not.
              </p>
            </div>

            <Card className="border-2 border-warning/30 mb-8">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4 text-warning">
                  Please Read Carefully Before Proceeding
                </h2>
                <p className="text-muted-foreground">
                  By using ReadingScreener, you acknowledge that you have read, understood, 
                  and agree to the following disclaimer.
                </p>
              </CardContent>
            </Card>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-semibold mt-8 mb-4">What This Service IS</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                <li>
                  <strong>An educational screening service</strong> that provides a brief look 
                  at foundational reading skills
                </li>
                <li>
                  <strong>Conducted by a graduate student</strong> in School Psychology with 
                  training in reading assessment
                </li>
                <li>
                  <strong>A first step</strong> in understanding potential reading concerns
                </li>
                <li>
                  <strong>An informational resource</strong> to help parents understand their 
                  child's reading development
                </li>
                <li>
                  <strong>A free service</strong> intended to increase access to early 
                  identification support
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">What This Service IS NOT</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                <li>
                  <strong>NOT a diagnostic evaluation</strong> — This screening cannot diagnose 
                  dyslexia, learning disabilities, ADHD, or any other condition
                </li>
                <li>
                  <strong>NOT a substitute for professional evaluation</strong> — If concerns 
                  are identified, formal evaluation by a licensed professional is recommended
                </li>
                <li>
                  <strong>NOT healthcare</strong> — This is an educational service, not a 
                  medical or psychological service
                </li>
                <li>
                  <strong>NOT HIPAA compliant</strong> — We are not a covered entity under 
                  HIPAA regulations
                </li>
                <li>
                  <strong>NOT conducted by a licensed professional</strong> — The assessor is 
                  a graduate student in training, not a licensed psychologist or certified 
                  educational diagnostician
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">Limitations of Screening</h2>
              <p className="text-muted-foreground mb-4">
                Reading screeners are designed to identify children who may be at risk for 
                reading difficulties. However, they have important limitations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                <li>
                  Screeners may produce <strong>false positives</strong> (identifying concerns 
                  when none exist) or <strong>false negatives</strong> (missing actual concerns)
                </li>
                <li>
                  A single screening provides only a <strong>snapshot</strong> of performance 
                  at one point in time
                </li>
                <li>
                  Performance can be affected by factors such as fatigue, anxiety, distraction, 
                  or unfamiliarity with the virtual format
                </li>
                <li>
                  Virtual screening may not capture all relevant information that would be 
                  available in an in-person assessment
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">When to Seek Professional Evaluation</h2>
              <p className="text-muted-foreground mb-4">
                You should consider seeking a formal evaluation from a qualified professional if:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                <li>The screening identifies potential areas of concern</li>
                <li>You continue to have concerns about your child's reading, regardless of screening results</li>
                <li>Your child is significantly behind grade-level expectations</li>
                <li>Your child has a family history of reading difficulties or learning disabilities</li>
                <li>Teachers have expressed concerns about your child's reading progress</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Formal evaluations can be requested through your child's school district 
                (at no cost under IDEA) or through private educational psychologists or 
                learning specialists.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">No Guarantee of Outcomes</h2>
              <p className="text-muted-foreground mb-6">
                We make no guarantees about the accuracy of screening results or the 
                effectiveness of any recommendations provided. Educational outcomes depend 
                on many factors beyond the scope of a brief screening.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Consent</h2>
              <p className="text-muted-foreground mb-6">
                By completing the intake form and scheduling an appointment, you indicate 
                that you have read and understood this disclaimer and consent to participate 
                in the screening service under these terms.
              </p>
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-6">
                If you understand and agree to these terms, you may proceed with the intake form.
              </p>
              <Link to="/intake">
                <Button size="lg" className="hero-gradient border-0 text-primary-foreground hover:opacity-90 gap-2">
                  I Understand, Continue to Intake
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
