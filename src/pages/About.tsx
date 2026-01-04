import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { 
  GraduationCap, 
  Target, 
  Shield, 
  Heart,
  ArrowRight,
  BookOpen,
  Users
} from "lucide-react";

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              About ReadingScreener
            </h1>
            <p className="text-xl text-muted-foreground">
              A free reading screening service created by a School Psychology graduate student 
              to help families understand their children's reading development.
            </p>
          </div>
        </div>
      </section>

      {/* About Me */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl hero-gradient mb-6">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                My Background
              </h2>
              <p className="text-muted-foreground mb-4">
                I'm a graduate student in School Psychology with specialized training in 
                educational assessment and reading development. My coursework and practicum 
                experiences have equipped me with knowledge of evidence-based reading 
                interventions and assessment practices.
              </p>
              <p className="text-muted-foreground mb-4">
                I created this free screening service to help families who may be concerned 
                about their child's reading but aren't sure where to start. Early identification 
                of reading difficulties can make a significant difference in a child's 
                educational journey.
              </p>
              <p className="text-muted-foreground">
                While I cannot provide formal diagnoses or official evaluations, I can offer 
                educational screenings that help identify potential areas of concern and 
                provide recommendations for next steps.
              </p>
            </div>
            <div className="grid gap-4">
              <Card className="card-elevated border-0">
                <CardContent className="pt-6">
                  <BookOpen className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Graduate Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Specialized coursework in reading development, assessment, and intervention.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Practicum Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Hands-on experience conducting assessments in school settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What I Offer */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              What I Offer
            </h2>
            <div className="grid gap-6">
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Educational Reading Screeners</h3>
                    <p className="text-muted-foreground">
                      Brief, standardized screening activities that assess foundational 
                      reading skills including phonological awareness, letter knowledge, 
                      decoding, fluency, and comprehension.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Supportive Summaries</h3>
                    <p className="text-muted-foreground">
                      After each session, you'll receive a summary that highlights your 
                      child's strengths, areas that may need support, and practical 
                      recommendations for home and school.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Privacy-Focused Service</h3>
                    <p className="text-muted-foreground">
                      Your family's information is kept confidential. I take data security 
                      seriously and only collect information necessary for the screening.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Important Information
            </h2>
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Screening vs. Diagnosis</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      <strong>This is a screening service</strong>, not a formal diagnostic 
                      evaluation. Screenings help identify potential concerns that may 
                      warrant further assessment.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      I cannot diagnose learning disabilities, dyslexia, or other conditions. 
                      Only qualified professionals (licensed psychologists, certified 
                      educational diagnosticians) can provide formal diagnoses.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      If concerns are identified, I'll provide recommendations for seeking 
                      formal evaluation through your school or private providers.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      This service is <strong>not HIPAA compliant</strong> and should be 
                      considered educational support, not healthcare.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Complete our intake form to schedule your free reading screener. 
            It only takes a few minutes.
          </p>
          <Link to="/intake">
            <Button size="lg" className="hero-gradient border-0 text-primary-foreground hover:opacity-90 gap-2">
              Start Intake Form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
