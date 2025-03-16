import React from "react";

const TermsOfService = () => {
  // Color scheme from provided values
  const colors = {
    primary: "#287094",     // Primary blue
    secondary: "#023246",   // Dark blue
    lightGray: "#D4D4CE",   // Light gray
    background: "#F6F6F6",  // Very light gray/off-white
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 rounded-lg" style={{ backgroundColor: colors.background }}>
      <h1 className="text-4xl font-bold text-center mb-2" style={{ color: colors.primary }}>Terms of Service</h1>
      <p className="text-center" style={{ color: colors.secondary }}>Effective Date: 02.06.2026</p>

      <div className="pl-4 py-2 rounded" style={{ borderLeft: `4px solid ${colors.primary}`, backgroundColor: colors.lightGray }}>
        <p className="italic" style={{ color: colors.secondary }}>
          These Terms of Service ("Terms") govern your use of PARiS Tours & Travels website, mobile applications, and services. Please read these Terms carefully before using our platform.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>1. Acceptance of Terms</h2>
        <p style={{ color: colors.secondary }}>
          By accessing or using our website, mobile applications, or any services offered by PARiS Tours & Travels (collectively, the "Services"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these Terms, you must not use our Services.
        </p>
        <p style={{ color: colors.secondary }}>
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our Services after any changes constitutes your acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>2. User Accounts</h2>
        <div className="ml-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.1. Account Registration</h3>
            <p style={{ color: colors.secondary }}>
              To access certain features of our Services, you may need to create an account. When registering for an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Provide accurate, current, and complete information about yourself.</li>
              <li>Maintain and promptly update your account information to keep it accurate, current, and complete.</li>
              <li>Be at least 18 years old or have the legal consent of a parent or guardian.</li>
              <li>Use a strong, unique password and keep it confidential.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.2. Account Security</h3>
            <p style={{ color: colors.secondary }}>
              You are solely responsible for maintaining the confidentiality and security of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Notify us immediately of any unauthorized use of your account or any other breach of security.</li>
              <li>Ensure that you log out from your account at the end of each session when using a shared computer.</li>
              <li>Not share your account credentials with any third party.</li>
              <li>Not create multiple accounts unless specifically permitted.</li>
            </ul>
            <p style={{ color: colors.secondary }}>
              We reserve the right to disable any user account if we believe you have violated any provision of these Terms or if your account shows signs of suspicious activity.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.3. Account Termination</h3>
            <p style={{ color: colors.secondary }}>
              We may, in our sole discretion, suspend or terminate your account and access to our Services for any reason, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Violation of these Terms.</li>
              <li>Extended periods of inactivity.</li>
              <li>Suspected fraudulent, abusive, or illegal activity.</li>
              <li>Failure to pay any fees or charges associated with your use of the Services.</li>
            </ul>
            <p style={{ color: colors.secondary }}>
              You may terminate your account at any time by following the instructions in your account settings or by contacting our customer support.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>3. Booking & Payments</h2>
        <div className="ml-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.1. Booking Process</h3>
            <p style={{ color: colors.secondary }}>
              When making a booking through our Services, you agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>All bookings are subject to availability and confirmation.</li>
              <li>You must provide accurate information for all travelers included in your booking.</li>
              <li>You are responsible for ensuring that all travelers meet the necessary requirements for travel, including valid passports, visas, vaccinations, and other entry requirements.</li>
              <li>Booking confirmation will be sent to the email address associated with your account.</li>
              <li>We recommend reviewing all booking details carefully before confirmation.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.2. Pricing and Payments</h3>
            <p style={{ color: colors.secondary }}>
              Regarding pricing and payments:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>All prices are displayed in the selected currency and may be subject to change until your booking is confirmed.</li>
              <li>Prices may not include additional fees such as taxes, resort fees, service charges, or other surcharges unless specifically stated.</li>
              <li>Payment methods accepted are displayed during the checkout process.</li>
              <li>Payment processing is handled securely by trusted third-party payment processors.</li>
              <li>For certain bookings, a deposit or full payment may be required at the time of booking.</li>
              <li>We reserve the right to cancel your booking if full payment is not received by the specified due date.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.3. Cancellations and Refunds</h3>
            <p style={{ color: colors.secondary }}>
              Our cancellation and refund policies vary depending on the type of booking and the policies of our travel partners:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Cancellation policies for each booking will be clearly indicated before confirmation.</li>
              <li>Refund eligibility and amounts are determined by when the cancellation is made and the specific cancellation policy applicable to your booking.</li>
              <li>Some bookings may be non-refundable or subject to cancellation fees.</li>
              <li>Refunds will be processed using the original payment method unless otherwise specified.</li>
              <li>Processing times for refunds vary depending on your payment provider.</li>
              <li>Changes to confirmed bookings may be subject to availability and additional fees.</li>
            </ul>
            <p style={{ color: colors.secondary }}>
              For detailed information on cancellation policies for specific bookings, please refer to your booking confirmation or contact our customer support.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>4. User Conduct</h2>
        <p style={{ color: colors.secondary }}>
          When using our Services, you agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>Violate any applicable laws, regulations, or third-party rights.</li>
          <li>Use our Services for any illegal or unauthorized purpose.</li>
          <li>Post or transmit harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content.</li>
          <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.</li>
          <li>Interfere with or disrupt the operation of our Services or servers.</li>
          <li>Attempt to gain unauthorized access to any part of our Services, other accounts, or computer systems.</li>
          <li>Use any automated system, software, or process to access our Services for any purpose.</li>
          <li>Engage in any data mining, scraping, or similar data gathering activities.</li>
        </ul>
        <p style={{ color: colors.secondary }}>
          Violation of these conduct guidelines may result in immediate termination of your account and access to our Services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>5. Intellectual Property</h2>
        <p style={{ color: colors.secondary }}>
          All content on our Services, including text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of PARiS Tours & Travels or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.
        </p>
        <p style={{ color: colors.secondary }}>
          You may not:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>Modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information obtained from our Services without our prior written consent.</li>
          <li>Use our trademarks, service marks, or logos without our prior written permission.</li>
          <li>Remove any copyright, trademark, or other proprietary notices from any content on our Services.</li>
        </ul>
        <p style={{ color: colors.secondary }}>
          Limited license: We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our Services for personal, non-commercial purposes in accordance with these Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>6. Limitation of Liability</h2>
        <p style={{ color: colors.secondary }}>
          To the maximum extent permitted by applicable law:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>We provide our Services "as is" and "as available," without any warranties, either express or implied.</li>
          <li>We do not guarantee that our Services will be uninterrupted, timely, secure, or error-free.</li>
          <li>We are not responsible for the accuracy, reliability, or content of any information provided by third parties through our Services.</li>
          <li>In no event shall PARiS Tours & Travels, its affiliates, or their respective officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our Services.</li>
          <li>Our total liability for any claims arising from or related to your use of our Services shall not exceed the amount paid by you to us during the six (6) months preceding the claim.</li>
        </ul>
        <p style={{ color: colors.secondary }}>
          Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for certain damages. Accordingly, some of the above limitations may not apply to you.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>7. Indemnification</h2>
        <p style={{ color: colors.secondary }}>
          You agree to indemnify, defend, and hold harmless PARiS Tours & Travels, its affiliates, partners, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>Your use of our Services.</li>
          <li>Your violation of these Terms.</li>
          <li>Your violation of any rights of another person or entity.</li>
          <li>Your content or information posted on or through our Services.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>8. Dispute Resolution</h2>
        <p style={{ color: colors.secondary }}>
          In the event of any dispute arising from or relating to these Terms or our Services:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>We encourage you to first contact us directly to seek a resolution.</li>
          <li>Any dispute that cannot be resolved through direct negotiation shall be resolved exclusively through arbitration in accordance with the rules of the American Arbitration Association.</li>
          <li>The arbitration shall be conducted in [City, State/Country].</li>
          <li>The arbitration decision shall be final and binding on both parties.</li>
          <li>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>9. Governing Law</h2>
        <p style={{ color: colors.secondary }}>
          These Terms and your use of our Services shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without giving effect to any principles of conflicts of law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>10. Contact Us</h2>
        <p style={{ color: colors.secondary }}>
          If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us at:
        </p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.lightGray }}>
          <p style={{ color: colors.secondary }}><strong>Email:</strong> <a href="mailto:muhammedjasirck07@gmail.com" style={{ color: colors.primary, textDecoration: "underline" }}>muhammedjasirck07@gmail.com</a></p>
          <p style={{ color: colors.secondary }}><strong>Phone:</strong> +91-9496455746</p>
          <p style={{ color: colors.secondary }}><strong>Address:</strong> Near Kotak Mahindra Bank, Nut Street, Vatakara, Calicut, Kerala, India</p>
        </div>
      </section>

      <div className="text-sm text-center pt-6" style={{ borderTop: `1px solid ${colors.lightGray}`, color: colors.secondary }}>
        <p>© 2026 PARiS Tours & Travels. All rights reserved.</p>
      </div>
    </div>
  );
};

export default TermsOfService;