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
        q: "What is a reading screener?",
        a: "A reading screener is a brief assessment that looks at foundational reading skills to identify potential areas of concern. It's not a diagnostic test, but rather a first step in understanding a child's reading development. Our screeners look at skills like letter knowledge, phonological awareness, decoding, fluency, and comprehension."
      },
      {
        q: "Is this a diagnostic evaluation?",
        a: "No. This is an educational screening service, not a formal diagnostic evaluation. Screenings can identify potential concerns that may warrant further assessment by a licensed professional. If concerns are identified, I'll provide recommendations for seeking formal evaluation through your school district or private providers."
      },
      {
        q: "Who conducts the screenings?",
        a: "I'm a graduate student in School Psychology with specialized training in educational assessment and reading development. I conduct all screenings personally and maintain confidentiality of all information."
      },
      {
        q: "Why is this service free?",
        a: "I offer free screenings as part of my graduate training and because I believe all families should have access to early identification services. I also offer paid follow-up services for families who want more in-depth support."
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
        a: "Yes, a parent or guardian should be present (or nearby) during the session. You can observe quietly in the background. This helps ensure the child feels comfortable and allows you to see the activities firsthand."
      },
      {
        q: "What technology do I need?",
        a: "You'll need a device (computer, tablet, or smartphone) with a camera and microphone, plus a stable internet connection. Sessions are conducted via Zoom."
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
        a: "Within 48 hours of the session, you'll receive a written summary that includes: observations from the session, your child's strengths, areas that may need support, and recommendations for home and school. If appropriate, I'll also include suggestions for follow-up evaluation."
      },
      {
        q: "Can I share the summary with my child's school?",
        a: "Absolutely! The summary is designed to be helpful for conversations with teachers and school staff. You can share it with anyone you choose."
      },
      {
        q: "What if concerns are identified?",
        a: "If the screening suggests potential reading difficulties, the summary will include recommendations for next steps. This might include requesting a formal evaluation from your school district, seeking private evaluation, or specific intervention strategies to try at home."
      },
      {
        q: "Do you offer follow-up services?",
        a: "Yes, I offer paid follow-up services including more comprehensive screenings, consultation calls, and ongoing progress monitoring. Information about these services will be included in your summary if relevant."
      }
    ]
  },
  {
    category: "Privacy & Data",
    questions: [
      {
        q: "How is my information protected?",
        a: "All information is kept confidential and stored securely. I only collect information necessary for the screening and do not share your information with third parties without your consent."
      },
      {
        q: "Is this service HIPAA compliant?",
        a: "This is an educational service, not a healthcare service, and is not HIPAA compliant. By using this service, you acknowledge that this is educational support, not healthcare or therapy."
      },
      {
        q: "Can I request my data be deleted?",
        a: "Yes, you can request deletion of your data at any time by contacting me directly. I'll confirm deletion within 7 business days."
      },
      {
        q: "Why do you ask about recording the Zoom session?",
        a: "Recording is optional and only done with your explicit consent. If recorded, the video is used solely for my own review and training purposes and is never shared. You can decline recording without affecting the service."
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
              Start Intake Form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
