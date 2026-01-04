import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { 
  ClipboardList, 
  Calendar, 
  Video, 
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Step 1: Complete the Intake Form",
    duration: "5-10 minutes",
    description: "Start by filling out our intake form. You'll provide basic information about your child and share your concerns about their reading development.",
    details: [
      "Parent/guardian contact information",
      "Student information (name, grade, school)",
      "Languages spoken at home",
      "Specific reading concerns you've noticed",
      "Current supports (if any)",
      "Consent for screening"
    ]
  },
  {
    icon: Calendar,
    title: "Step 2: Schedule Your Session",
    duration: "2 minutes",
    description: "After submitting the intake form, you'll be able to schedule a convenient time for the screening session.",
    details: [
      "Choose from available time slots",
      "Sessions available Mon-Fri 3-6pm and weekends 3-6pm",
      "Sessions are 30 minutes long",
      "Receive confirmation with Zoom link"
    ]
  },
  {
    icon: Video,
    title: "Step 3: Attend the Zoom Session",
    duration: "30 minutes",
    description: "Join the virtual session at your scheduled time. Your child will participate in engaging reading activities while you observe.",
    details: [
      "Join from any device with camera/microphone",
      "Child-friendly, engaging activities",
      "Parent can observe the session",
      "Activities assess various reading skills"
    ]
  },
  {
    icon: FileText,
    title: "Step 4: Receive Your Summary",
    duration: "Within 48 hours",
    description: "After the session, you'll receive a detailed summary report with observations, strengths, and recommendations.",
    details: [
      "Overview of screening activities completed",
      "Your child's strengths",
      "Areas that may need support",
      "Recommendations for home and school",
      "Suggested next steps"
    ]
  }
];

const expectations = [
  {
    title: "What to Have Ready",
    items: [
      "A quiet space with minimal distractions",
      "Computer, tablet, or phone with camera and microphone",
      "Stable internet connection",
      "Your child available for the session"
    ]
  },
  {
    title: "During the Session",
    items: [
      "I'll start by introducing myself and explaining activities",
      "Your child will complete brief, game-like activities",
      "Activities cover letter knowledge, sounds, words, and reading",
      "Sessions are designed to be encouraging and low-stress"
    ]
  },
  {
    title: "After the Session",
    items: [
      "You'll receive a summary within 48 hours",
      "We can schedule a brief follow-up call if needed",
      "Recommendations for further evaluation if warranted",
      "Option to book paid follow-up services"
    ]
  }
];

export default function HowItWorks() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Our simple 4-step process makes it easy to get started with a 
              free virtual reading screener for your child.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="card-elevated border-0 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 hero-gradient p-6 flex flex-col items-center justify-center text-center">
                          <step.icon className="h-12 w-12 text-primary-foreground mb-3" />
                          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                            <Clock className="h-4 w-4" />
                            {step.duration}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail) => (
                              <li key={detail} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex justify-center py-4">
                      <div className="w-0.5 h-8 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            What to Expect
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {expectations.map((section) => (
              <Card key={section.title} className="card-elevated border-0">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-primary">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            The intake form takes just 5-10 minutes. 
            Start your child's reading screening journey today.
          </p>
          <Link to="/intake">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Intake Form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
