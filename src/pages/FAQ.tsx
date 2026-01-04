import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    category: "About the Service",
    questions: [
      {
        q: "What is a reading screening?",
        a: "A reading screening is a brief assessment that looks at foundational reading skills to identify potential areas of concern and risk patterns. It's not a diagnostic test, but rather a first step in understanding a child's reading development. Our screenings look at skills like phonological awareness, phonics/decoding, sight words, fluency, and comprehension indicators."
      },
      {
        q: "Is this a diagnostic evaluation?",
        a: "No. This is an educational screening service to identify skill patterns and risk. It does not diagnose a disability. Screenings can identify potential concerns that may warrant further assessment by a licensed professional. If concerns are identified, I'll provide clear recommendations for next steps."
      },
      {
        q: "Who conducts the screenings?",
        a: "I'm an Educational Specialist with 16 years of experience spanning from classroom teacher (intellectual disabilities and autism) to administrative dean. My background includes MTSS/RTI systems, special education processes, 504 plans, and educational assessment."
      },
      {
        q: "Why is this service free?",
        a: "Free screening is available because I believe all families should have access to early identification services. I also offer paid upgrades (Comprehensive Literacy Review) for families who want extended assessment, a detailed report, and an interpretation call."
      },
      {
        q: "What is the \"Comprehensive Literacy Review\" upgrade?",
        a: "The paid upgrade includes: a Part 2 extended assessment session targeted based on screener results, a comprehensive written report with interpretation, intervention plans, accommodation suggestions, school support pathways guidance, and a 30-minute interpretation call with me."
      }
    ]
  },
  {
    category: "Virtual Validity & Integrity",
    questions: [
      {
        q: "How do you ensure my child is responding meaningfully?",
        a: "Our Split-Screen Assessment System keeps the student view completely clean—just the stimulus, no distractions. I observe behavior throughout and capture detailed observations about attention, effort, and engagement. At the end of each session, I rate validity to flag any concerns."
      },
      {
        q: "What if my child is distracted or guessing?",
        a: "I monitor for signs of inattention, impulsivity, frustration, and avoidance throughout the session. If results may not reflect true skill due to testing conditions, this is documented in the validity notes and affects interpretation. Recommendations are adjusted accordingly."
      },
      {
        q: "Why does a parent need to be present?",
        a: "Parent presence helps ensure the child feels comfortable and supported. It also provides accountability for testing conditions—quiet space, minimal distractions, and stable technology. You can observe quietly in the background."
      },
      {
        q: "What behaviors do you observe and why?",
        a: "I rate attention, effort, impulsivity, frustration tolerance, avoidance behaviors, and responsiveness to redirection. These observations help interpret results and identify when performance may not reflect true ability."
      },
      {
        q: "What happens if results may not be valid?",
        a: "Results are interpreted within testing conditions. If distractions or technology influenced performance, it is noted. The validity status (valid, questionable, or invalid) affects how results are presented and what next steps are recommended."
      }
    ]
  },
  {
    category: "Scheduling & Sessions",
    questions: [
      {
        q: "How long are the screening sessions?",
        a: "Each session is approximately 30 minutes. This includes time for introduction, the actual screening activities, and wrapping up."
      },
      {
        q: "What ages/grades do you serve?",
        a: "I work with students in grades K-12. The specific screening activities are adapted based on the child's age and grade level."
      },
      {
        q: "Do I need to be present during the session?",
        a: "Yes, a parent or guardian must be present for the full session. This ensures your child feels comfortable and allows you to observe firsthand. It also helps maintain testing validity."
      },
      {
        q: "What technology do I need?",
        a: "You'll need a device (computer or tablet recommended) with a camera and microphone, plus a stable internet connection. Sessions use our web-based Split-Screen Assessment System."
      },
      {
        q: "Can I reschedule if something comes up?",
        a: "Yes! Please contact me as soon as possible if you need to reschedule. I ask for at least 24 hours notice when possible."
      }
    ]
  },
  {
    category: "After the Screening",
    questions: [
      {
        q: "What will I receive after the screening?",
        a: "Within 48 hours, you'll have access to your Parent Portal with: risk level (low to critical), domain-by-domain results, a downloadable 1-page summary, and a \"what to do next\" checklist. If you upgrade, you'll also receive a comprehensive report and interpretation call."
      },
      {
        q: "What are the risk levels?",
        a: "Risk levels are: Low (skills appear on track), Moderate (some areas of concern worth monitoring), High (multiple concerns suggesting intervention is needed), and Critical (significant concerns requiring immediate action)."
      },
      {
        q: "Can I share the summary with my child's school?",
        a: "Absolutely! The summary is designed to be helpful for conversations with teachers and school staff. You can share it with anyone you choose."
      },
      {
        q: "What if concerns are identified?",
        a: "If screening suggests potential reading difficulties, the results will include recommendations for next steps. This might include: requesting a formal evaluation from your school district, requesting a 504 plan or intervention plan, seeking private evaluation, or specific intervention strategies for home."
      },
      {
        q: "What does the \"advocacy guidance\" include?",
        a: "For high or critical risk levels, you'll receive guidance on: what to request from the school, how to request an evaluation, understanding 504 vs IEP vs intervention plans, and when to consider an educational advocate. We provide sample language you can use in emails to the school."
      }
    ]
  },
  {
    category: "Privacy & Data",
    questions: [
      {
        q: "How is my information protected?",
        a: "All information is kept confidential and stored securely with access limited to authorized staff. I only collect information necessary for the screening and do not share your information with third parties without your consent."
      },
      {
        q: "Is this service HIPAA compliant?",
        a: "This is an educational screening service, not healthcare. HIPAA typically does not apply. We still protect your information and limit access. By using this service, you acknowledge that this is educational support, not healthcare or therapy."
      },
      {
        q: "Can I request my data be deleted?",
        a: "Yes, you can request deletion of your data at any time by contacting me directly. I'll confirm deletion within 7 business days."
      },
      {
        q: "Why do you ask about recording the session?",
        a: "Recording is optional and only done with your explicit consent. If recorded, audio is used solely for scoring verification and quality assurance, and is subject to retention limits. You can decline recording without affecting the service."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions about our free reading screening service? 
              Find answers to common questions below.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-8 pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold mb-4 text-primary">
                  {section.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`${section.category}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Can't find the answer you're looking for? Start the intake form 
            and feel free to share any questions or concerns.
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
