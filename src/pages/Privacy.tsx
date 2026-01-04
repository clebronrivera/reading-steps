import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Privacy() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto prose prose-slate">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
            
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use our reading screening service, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong>Parent/Guardian Information:</strong> Name, email address, and phone number</li>
              <li><strong>Student Information:</strong> Name, date of birth, grade, school, and languages spoken at home</li>
              <li><strong>Screening Information:</strong> Reading concerns, current supports, and your observations about your child's reading</li>
              <li><strong>Session Data:</strong> Appointment times, screening results, and assessor notes</li>
              <li><strong>Technical Information:</strong> Timezone and basic device/browser information for session scheduling</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Schedule and conduct reading screening sessions</li>
              <li>Prepare personalized screening activities appropriate for your child</li>
              <li>Create summary reports and recommendations</li>
              <li>Communicate with you about appointments and follow-up services</li>
              <li>Improve our screening service and processes</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p className="text-muted-foreground mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              Your information may be shared only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>With your explicit consent (e.g., if you ask us to share the summary with a school)</li>
              <li>To comply with legal obligations or respond to legal process</li>
              <li>To protect the rights, property, or safety of our service, users, or others</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-6">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Data Retention</h2>
            <p className="text-muted-foreground mb-6">
              We retain your information for as long as necessary to provide our services and fulfill 
              the purposes described in this policy. You may request deletion of your data at any time 
              by contacting us.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Zoom Recording</h2>
            <p className="text-muted-foreground mb-6">
              If you consent to session recording, the recording will be stored securely and used 
              only for quality improvement and training purposes. Recordings are never shared with 
              third parties and will be deleted upon your request.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent for optional data uses (e.g., Zoom recording)</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground mb-6">
              Our service involves collecting information about children for educational screening 
              purposes. We collect this information only with parental consent and use it solely 
              for the purposes described in this policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Not a Healthcare Service</h2>
            <p className="text-muted-foreground mb-6">
              This is an educational screening service, not a healthcare service. We are not 
              HIPAA-covered entities and this service is not HIPAA compliant. By using our 
              service, you acknowledge that this is educational support, not healthcare.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground mb-6">
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please 
              contact us through the intake form or during your scheduled session.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
