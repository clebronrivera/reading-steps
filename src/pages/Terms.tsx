import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Terms() {
  return (
    <PublicLayout>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto prose prose-slate">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
            
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-6">
              By accessing or using the ReadingScreener service, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-6">
              ReadingScreener provides free virtual reading screening sessions conducted by a 
              School Psychology graduate student. The service includes intake processing, 
              appointment scheduling, virtual screening sessions via Zoom, and summary reports.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Eligibility</h2>
            <p className="text-muted-foreground mb-6">
              This service is intended for parents and guardians of children in grades K-12 
              who have concerns about their child's reading development. By using this service, 
              you represent that you are the parent or legal guardian of the child being screened, 
              or have authorization from the parent or legal guardian.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Educational Purpose Only</h2>
            <p className="text-muted-foreground mb-4">
              <strong>IMPORTANT:</strong> This service is for educational purposes only and is 
              NOT a substitute for professional diagnostic evaluation. By using this service, 
              you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>This is a screening service, not a diagnostic evaluation</li>
              <li>The assessor is a graduate student, not a licensed psychologist</li>
              <li>Results do not constitute a diagnosis of any learning disability or condition</li>
              <li>This service is not healthcare and is not HIPAA compliant</li>
              <li>You should seek formal evaluation from qualified professionals if concerns are identified</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Provide accurate and complete information in the intake form</li>
              <li>Ensure a suitable environment for the screening session</li>
              <li>Attend scheduled appointments or provide timely notice of cancellation</li>
              <li>Supervise your child during the screening session</li>
              <li>Not misuse the service or interfere with its operation</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Appointments and Cancellations</h2>
            <p className="text-muted-foreground mb-6">
              Appointments are scheduled based on availability. We ask that you provide at least 
              24 hours notice if you need to cancel or reschedule. Repeated no-shows may result 
              in suspension from the service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-6">
              All content, materials, and methods used in our screening service are protected 
              by intellectual property rights. You may not reproduce, distribute, or create 
              derivative works from our materials without permission.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-6">
              To the maximum extent permitted by law, ReadingScreener and its operator shall 
              not be liable for any indirect, incidental, special, consequential, or punitive 
              damages arising from your use of the service. The screening results and 
              recommendations are provided for informational purposes only.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-6">
              The service is provided "as is" without warranties of any kind, express or implied. 
              We do not warrant that the service will be uninterrupted, error-free, or that 
              screening results will be accurate or complete.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">10. Privacy</h2>
            <p className="text-muted-foreground mb-6">
              Your use of the service is also governed by our Privacy Policy. By using the 
              service, you consent to the collection and use of information as described in 
              the Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">11. Modifications</h2>
            <p className="text-muted-foreground mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting. Your continued use of the service after changes 
              constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">12. Termination</h2>
            <p className="text-muted-foreground mb-6">
              We reserve the right to terminate or suspend access to our service at our sole 
              discretion, without notice, for conduct that we believe violates these terms or 
              is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground mb-6">
              These terms shall be governed by and construed in accordance with applicable 
              state and federal laws, without regard to conflict of law principles.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us through 
              the intake form or during your scheduled session.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
