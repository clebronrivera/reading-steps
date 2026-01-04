import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { 
  BookOpen, 
  Calendar, 
  Video, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Clock,
  Heart
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Virtual Sessions",
    description: "Convenient Zoom-based screeners from the comfort of your home.",
  },
  {
    icon: Clock,
    title: "30-Minute Sessions",
    description: "Quick, focused sessions designed to be engaging for your child.",
  },
  {
    icon: FileText,
    title: "Detailed Summary",
    description: "Receive a comprehensive summary with actionable next steps.",
  },
  {
    icon: Shield,
    title: "Confidential & Secure",
    description: "Your child's information is kept private and secure.",
  },
];

const steps = [
  {
    number: "1",
    title: "Complete Intake Form",
    description: "Tell us about your child and your concerns.",
  },
  {
    number: "2",
    title: "Schedule Session",
    description: "Pick a convenient time for a 30-minute virtual screener.",
  },
  {
    number: "3",
    title: "Join Zoom Session",
    description: "Your child participates in engaging reading activities.",
  },
  {
    number: "4",
    title: "Get Your Summary",
    description: "Receive insights, strengths, and recommendations.",
  },
];

const concerns = [
  "Letter recognition",
  "Letter sounds",
  "Sounding out words",
  "Reading fluency",
  "Reading comprehension",
  "Spelling difficulties",
];

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Free Virtual Reading Screeners
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Is Your Child Struggling{" "}
              <span className="text-gradient">to Read?</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a free, 30-minute virtual reading screener with a School Psychology graduate student. 
              Understand your child's reading development and get actionable next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/intake">
                <Button size="lg" className="hero-gradient border-0 text-primary-foreground hover:opacity-90 gap-2">
                  Book a Free Screener
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Concerns Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Common Reading Concerns We Screen For
            </h2>
            <p className="text-muted-foreground">
              Not sure if your child needs support? Here are some signs parents notice:
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {concerns.map((concern) => (
              <div
                key={concern}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Choose Our Free Screening?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our virtual reading screeners are designed to be accessible, 
              informative, and supportive for families.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-elevated border-0">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Simple steps to get started with your free reading screener.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full hero-gradient text-primary-foreground text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/intake">
              <Button size="lg" className="hero-gradient border-0 text-primary-foreground hover:opacity-90 gap-2">
                Start Your Intake Form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Supporting Families, One Screener at a Time
            </h2>
            <p className="text-muted-foreground mb-6">
              As a School Psychology graduate student, I'm dedicated to helping families 
              understand their children's reading development. This free screening service 
              is designed to provide early insights and connect you with resources to support 
              your child's literacy journey.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Please note: This is an educational screening service, not a diagnostic assessment. 
              See our <Link to="/disclaimer" className="text-primary hover:underline">screening disclaimer</Link> for more information.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-foreground">
            Ready to Learn More About Your Child's Reading?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Book your free 30-minute virtual reading screener today. 
            No cost, no obligation—just helpful insights.
          </p>
          <Link to="/intake">
            <Button size="lg" variant="secondary" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book a Free Screener
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
