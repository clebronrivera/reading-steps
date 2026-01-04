import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { 
  ClipboardList, 
  Calendar, 
  Monitor, 
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Gift
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Step 1: Free Intake",
    duration: "5-10 minutes",
    description: "Complete our intake form with information about your child, your concerns, and any current school supports.",
    details: [
      "Parent/guardian contact information",
      "Student information (name, grade, school)",
      "Current school supports (MTSS, 504, IEP if applicable)",
      "Specific reading concerns you've noticed",
      "Your goals for this screening",
      "Consent for screening"
    ]
  },
  {
    icon: Calendar,
    title: "Step 2: Book Free Screener",
    duration: "2 minutes",
    description: "Choose a convenient time for your 30-minute Split-Screen Assessment Session.",
    details: [
      "Choose from available time slots",
      "Sessions available evenings and weekends",
      "Sessions are 30 minutes",
      "Receive confirmation with session link"
    ]
  },
  {
    icon: Monitor,
    title: "Step 3: Live Split-Screen Screening Session",
    duration: "30 minutes",
    description: "Your child participates in engaging reading activities through our Split-Screen Assessment System. You'll observe while I administer standardized screening tasks.",
    details: [
      "Student sees clean stimulus screen (distraction-free)",
      "Activities assess phonological awareness, decoding, fluency, and more",
      "Parent present and can observe",
      "Real-time scoring and observations captured"
    ]
  },
  {
    icon: FileText,
    title: "Step 4: Results in Parent Portal + Next Steps",
    duration: "Within 48 hours",
    description: "Access your results through the Parent Portal. See your child's risk level, strengths, and a \"what to do next\" checklist.",
    details: [
      "Risk level (low, moderate, high, critical)",
      "Domain-by-domain results",
      "Downloadable 1-page summary (free)",
      "\"What to do next\" checklist",
      "Upgrade option for comprehensive review"
    ],
    highlight: true
  }
];

const freeIncludes = [
  "Complete intake and background gathering",
  "30-minute live screening session",
  "Results summary with risk level",
  "Parent Portal access",
  "Downloadable 1-page summary",
  "\"What to do next\" checklist"
];

const paidUpgrade = {
  title: "Comprehensive Literacy Review",
  subtitle: "For families who want the full picture",
  includes: [
    "Part 2 extended assessment session (targeted based on screener results)",
    "Comprehensive written report with:",
    "— Background summary from intake",
    "— Results by literacy domain",
    "— Interpretation (what it suggests, what it does not prove)",
    "— Intervention plan for home and school",
    "— Three accommodation suggestions",
    "— School support pathways guidance (504, IEP, evaluation request)",
    "— Progress monitoring plan",
    "30-minute interpretation call with Educational Specialist"
  ]
};

const expectations = [
  {
    title: "What to Have Ready",
    items: [
      "A quiet space with minimal distractions",
      "Computer or tablet with camera and microphone",
      "Stable internet connection",
      "Parent present for the full session"
    ]
  },
  {
    title: "During the Session",
    items: [
      "I'll introduce the activities and put your child at ease",
      "Your child sees only the stimulus—clean and focused",
      "I control pacing and capture responses in real-time",
      "Sessions are encouraging and designed to minimize frustration"
    ]
  },
  {
    title: "After the Session",
    items: [
      "Results available in Parent Portal within 48 hours",
      "Clear next steps based on risk level",
      "Option to upgrade for comprehensive report",
      "Guidance on how to talk to your child's school"
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
              Our simple 4-step process takes you from intake to actionable next steps. 
              Free screening included—upgrade available for comprehensive support.
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
                  <Card className={`card-elevated border-0 overflow-hidden ${step.highlight ? 'ring-2 ring-primary/20' : ''}`}>
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

      {/* Free vs Paid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            Free Screening vs. Comprehensive Review
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="card-elevated border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Free Screening</h3>
                    <p className="text-sm text-muted-foreground">No cost, no obligation</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {freeIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Paid Upgrade */}
            <Card className="card-elevated border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg hero-gradient">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{paidUpgrade.title}</h3>
                    <p className="text-sm text-muted-foreground">{paidUpgrade.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {paidUpgrade.includes.map((item) => (
                    <li key={item} className={`flex items-start gap-2 text-sm ${item.startsWith('—') ? 'ml-6' : ''}`}>
                      {!item.startsWith('—') && <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-muted/30">
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
              Book Free Screener
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
