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
  Users,
  School,
  ClipboardCheck,
  Award
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
              An educational screening service created by an Educational Specialist 
              to help families get clear, timely information about their children's reading development.
            </p>
          </div>
        </div>
      </section>

      {/* About Me - Educational Specialist Positioning */}
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
                I'm an <strong>Educational Specialist with 16 years of experience</strong> spanning 
                from classroom teacher (intellectual disabilities and autism) to administrative dean. 
                My career has given me deep insight into how schools work—and where they fall short.
              </p>
              <p className="text-muted-foreground mb-4">
                My experience includes enrollment processes, intervention systems (MTSS/RTI), 
                special education procedures, transition planning, and higher education accommodations. 
                I understand the full continuum of educational support.
              </p>
              <p className="text-muted-foreground">
                I created this screening platform because I've seen firsthand how families struggle 
                to get timely, clear information about their children's reading development. 
                Early identification makes all the difference.
              </p>
            </div>
            <div className="grid gap-4">
              <Card className="card-elevated border-0">
                <CardContent className="pt-6">
                  <School className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">16 Years in Education</h3>
                  <p className="text-sm text-muted-foreground">
                    From special education teacher to administrative leadership roles.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6">
                  <ClipboardCheck className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Systems Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    MTSS/RTI, 504 plans, IEPs, evaluation processes, and school advocacy.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6">
                  <Award className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Specialized Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Graduate training in reading assessment, intervention, and educational diagnostics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why I Built This */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Why I Built This Platform
              </h2>
            </div>
            <div className="grid gap-6">
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Parents Need Clear, Timely Information</h3>
                    <p className="text-muted-foreground">
                      Too many families wait months—sometimes years—for answers about their child's 
                      reading development. Schools have limited resources and long waitlists. 
                      Parents deserve to know now, not later.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Schools Vary in Communication and Speed</h3>
                    <p className="text-muted-foreground">
                      Some schools are proactive; others require significant parent advocacy. 
                      This platform gives families independent insight so they can have informed 
                      conversations with teachers and administrators.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-elevated border-0">
                <CardContent className="pt-6 flex gap-4">
                  <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Early Screening Reduces Long-Term Harm</h3>
                    <p className="text-muted-foreground">
                      Reading difficulties that go unidentified lead to widening skill gaps, 
                      frustration, and academic consequences. Early screening opens the door 
                      to early intervention—when it matters most.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes - Screening vs Diagnosis */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Important Information
            </h2>
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Screening vs. Diagnosis</h3>
                <div className="p-4 mb-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-primary font-medium text-center">
                    "This is a screening service to identify skill patterns and risk. It does not diagnose a disability."
                  </p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      <strong>Screenings identify patterns and concerns</strong> that may 
                      warrant further assessment by licensed professionals.
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
                      If concerns are identified, I'll provide clear recommendations for seeking 
                      formal evaluation through your school or private providers.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">•</span>
                    <span>
                      This is an <strong>educational screening service, not healthcare</strong>. 
                      HIPAA typically does not apply. We still protect your information and limit access.
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
            Complete our intake form to book your free reading screener. 
            It only takes a few minutes.
          </p>
          <Link to="/intake">
            <Button size="lg" className="hero-gradient border-0 text-primary-foreground hover:opacity-90 gap-2">
              Book Free Screener
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
