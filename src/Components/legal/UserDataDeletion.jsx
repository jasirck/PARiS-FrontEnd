import React from "react";

const UserDataDeletion = () => {
  // Color scheme from provided values
  const colors = {
    primary: "#287094",     // Primary blue
    secondary: "#023246",   // Dark blue
    lightGray: "#D4D4CE",   // Light gray
    background: "#F6F6F6",  // Very light gray/off-white
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 rounded-lg" style={{ backgroundColor: colors.background }}>
      <h1 className="text-4xl font-bold text-center mb-2" style={{ color: colors.primary }}>User Data Deletion Policy</h1>
      <p className="text-center" style={{ color: colors.secondary }}>Effective Date: 02.06.2026</p>

      <div className="pl-4 py-2 rounded" style={{ borderLeft: `4px solid ${colors.primary}`, backgroundColor: colors.lightGray }}>
        <p className="italic" style={{ color: colors.secondary }}>
          At PARiS Tours & Travels, we respect your right to privacy and control over your personal information. This policy explains how you can request deletion of your data and how we handle such requests.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>1. Your Right to Data Deletion</h2>
        <p style={{ color: colors.secondary }}>
          In accordance with applicable privacy laws and regulations, you have the right to request the deletion of your personal information from our systems. We are committed to honoring these requests in a timely and transparent manner, subject to legal and operational constraints.
        </p>
        <p style={{ color: colors.secondary }}>
          Please note that certain information may need to be retained for legitimate business purposes, legal obligations, or to complete transactions that were initiated prior to your deletion request.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>2. Requesting Data Deletion</h2>
        <p style={{ color: colors.secondary }}>
          You can request the deletion of your account and associated personal information through several methods:
        </p>
        <div className="ml-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.1. Self-Service Deletion</h3>
            <p style={{ color: colors.secondary }}>
              The easiest way to delete your account is through our website:
            </p>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Log in to your PARiS Tours & Travels account</li>
              <li>Navigate to <strong>Profile &gt; Settings &gt; Privacy</strong></li>
              <li>Select the <strong>Delete My Account</strong> option</li>
              <li>Follow the confirmation steps to verify your identity</li>
              <li>Receive confirmation of your deletion request</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.2. Email Request</h3>
            <p style={{ color: colors.secondary }}>
              If you prefer to submit your request via email:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Send an email to <a href="mailto:muhammedjasirck07@gmail.com" style={{ color: colors.primary, textDecoration: "underline" }}>muhammedjasirck07@gmail.com</a> with the subject line "Account Deletion Request"</li>
              <li>Include your full name and the email address associated with your account</li>
              <li>For security purposes, we may ask you to verify your identity through additional information</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>2.3. Customer Support</h3>
            <p style={{ color: colors.secondary }}>
              You can also contact our customer support team:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>By phone: +1-234-567-8910 (Monday to Friday, 9 AM - 6 PM CET)</li>
              <li>Through the live chat feature on our website or mobile app</li>
              <li>By submitting a request through our contact form</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>3. Data Removal Process</h2>
        <div className="ml-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.1. Verification</h3>
            <p style={{ color: colors.secondary }}>
              To protect your privacy and security, we will first verify your identity before processing your deletion request. This verification process may include:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Confirming the email address associated with your account</li>
              <li>Asking security questions established during account creation</li>
              <li>Sending a verification code to your registered email or phone number</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.2. Processing Timeline</h3>
            <p style={{ color: colors.secondary }}>
              Upon receiving and verifying your deletion request, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li>Begin processing your request within 7 business days</li>
              <li>Complete the deletion process within <strong>30 calendar days</strong></li>
              <li>Send you a confirmation email once the deletion process is complete</li>
            </ul>
            <p style={{ color: colors.secondary }}>
              In certain cases, we may need additional time to process your request due to technical complexity or the volume of data involved. If this occurs, we will notify you of the delay and provide an estimated completion date.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.3. Data Removal Scope</h3>
            <p style={{ color: colors.secondary }}>
              When you request account deletion, we will remove:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li><span className="font-medium">Account Information:</span> Username, password, profile pictures, and personal preferences</li>
              <li><span className="font-medium">Personal Details:</span> Name, contact information, address, and payment methods</li>
              <li><span className="font-medium">Booking History:</span> Past and upcoming travel bookings (subject to completion of services)</li>
              <li><span className="font-medium">Communication Records:</span> Chat history, customer service interactions, and feedback submissions</li>
              <li><span className="font-medium">Marketing Preferences:</span> Email subscriptions, notification settings, and promotional opt-ins</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>3.4. Data Retention Exceptions</h3>
            <p style={{ color: colors.secondary }}>
              Certain information may be retained even after account deletion for the following legitimate purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
              <li><span className="font-medium">Legal Compliance:</span> Information required by law for tax, accounting, or regulatory purposes (typically retained for 7 years)</li>
              <li><span className="font-medium">Fraud Prevention:</span> Limited data to prevent fraudulent activity and protect our services</li>
              <li><span className="font-medium">Dispute Resolution:</span> Information related to ongoing disputes, claims, or legal proceedings</li>
              <li><span className="font-medium">Service Improvement:</span> De-identified or aggregated data that cannot be linked back to you</li>
              <li><span className="font-medium">Backup Systems:</span> Residual information in encrypted backup systems that will be automatically purged according to our data retention schedule</li>
            </ul>
            <p style={{ color: colors.secondary }}>
              Any retained information will be securely stored with appropriate access restrictions and will be permanently deleted once the retention purpose is fulfilled.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>4. Consequences of Account Deletion</h2>
        <p style={{ color: colors.secondary }}>
          Before requesting account deletion, please be aware of the following consequences:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>You will lose access to all account features and services</li>
          <li>Any unused credits, rewards points, or loyalty benefits may be forfeited</li>
          <li>Upcoming bookings may be affected - we recommend resolving or transferring these before deletion</li>
          <li>You will need to create a new account if you wish to use our services again in the future</li>
          <li>Account deletion is permanent and cannot be reversed once completed</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>5. Third-Party Data</h2>
        <p style={{ color: colors.secondary }}>
          We work with various third-party service providers to deliver our travel services. When you request account deletion:
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: colors.secondary }}>
          <li>We will make reasonable efforts to relay your deletion request to third parties with whom we have shared your personal information</li>
          <li>However, we cannot guarantee the deletion of data from all third-party systems</li>
          <li>You may need to contact some service providers directly to ensure complete removal of your information</li>
        </ul>
        <p style={{ color: colors.secondary }}>
          For a list of our primary service providers and their contact information, please refer to our Privacy Policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>6. Contact Us</h2>
        <p style={{ color: colors.secondary }}>
          For any questions, concerns, or additional assistance regarding your data deletion request, please contact our Privacy Team:
        </p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.lightGray }}>
          <p style={{ color: colors.secondary }}><strong>Email:</strong> <a href="mailto:muhammedjasirck07@gmail.com" style={{ color: colors.primary, textDecoration: "underline" }}>muhammedjasirck07@gmail.com</a></p>
          <p style={{ color: colors.secondary }}><strong>Phone:</strong> +91-9496455746</p>
          <p style={{ color: colors.secondary }}><strong>Address:</strong> Near Kotak Mahindra Bank, Nut Street, Vatakara, Calicut, Kerala, India</p>
        </div>
        <p style={{ color: colors.secondary }}>
          We are committed to handling your deletion request with care and respect for your privacy rights.
        </p>
      </section>

      <div className="text-sm text-center pt-6" style={{ borderTop: `1px solid ${colors.lightGray}`, color: colors.secondary }}>
        <p>© 2026 PARiS Tours & Travels. All rights reserved.</p>
      </div>
    </div>
  );
};

export default UserDataDeletion;