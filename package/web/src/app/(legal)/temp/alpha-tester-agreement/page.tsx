export default function Page() {
  return (
    <div className="w-full overflow-y-auto max-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 ">
        <div className="bg-white shadow rounded-lg p-8">
          <header className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Alpha Tester Participation Agreement
            </h1>
            <p className="text-gray-600">
              Thank you for participating in our alpha testing program. This
              agreement outlines the terms and conditions for your
              participation.
            </p>
          </header>

          <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">
              Alpha Testing Notice
            </h2>
            <p className="text-gray-700">
              You are participating in an early alpha version of our service.
              Features may change, break, or disappear without notice. Your
              feedback is invaluable in helping us improve.
            </p>
          </div>

          <div className="prose prose-indigo max-w-none space-y-8">
            {/* Introduction and Purpose */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Introduction and Purpose
              </h2>
              <div className="space-y-4">
                <p>
                  Thank you for agreeing to participate in the closed alpha
                  testing of Birdiemail ("the Application"). The purpose of this
                  testing is to identify bugs, gather feedback, and improve the
                  Application before any potential public release. Your
                  participation is voluntary and you may withdraw at any time.
                </p>
              </div>
            </section>

            {/* Data Collection and Processing */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Data Collection and Processing
              </h2>
              <div className="space-y-4">
                <p>
                  During testing, the following data may be collected and
                  processed:
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    User Identification:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      User ID (randomly generated UUID, plaintext, internal use
                      only)
                    </li>
                    <li>Name and surname (plaintext)</li>
                    <li>Email address (plaintext)</li>
                    <li>Password (stored as salted bcrypt hash)</li>
                    <li>Email verification status (boolean)</li>
                    <li>
                      Verification code (random string, plaintext, for
                      verification only)
                    </li>
                    <li>
                      Logout hash (random string, plaintext, for mass logout
                      purposes)
                    </li>
                    <li>
                      Account creation, modification, deletion timestamps
                      (plaintext)
                    </li>
                    <li>
                      Access rights and permission logs (plaintext, for admin
                      access management only)
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Mail Server Settings:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      IMAP server address, port, security type (plaintext)
                    </li>
                    <li>
                      SMTP server address, port, security type (plaintext)
                    </li>
                    <li>
                      Timestamps for server data creation and modification
                      (plaintext)
                    </li>
                    <li>
                      Note: Each mail server is added once and shared among
                      relevant users.
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Mail Account Data:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name and surname (plaintext)</li>
                    <li>Email address (plaintext)</li>
                    <li>
                      Mail account password (encrypted with AES-256 using cipher
                      derived from your user password, zero-knowledge
                      encryption)
                    </li>
                    <li>
                      Account creation and modification timestamps (plaintext)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Protection and Privacy */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Data Protection and Privacy (GDPR Compliance)
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Legal Basis:
                  </h3>
                  <p>
                    Your data is processed based on your explicit consent (Art.
                    6(1)(a) GDPR) and is strictly necessary for the purposes of
                    testing and developing the Application.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Security Measures:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      All passwords are stored as salted hashes (bcrypt) or
                      encrypted (AES-256).
                    </li>
                    <li>Data is encrypted in transit (TLS) and at rest.</li>
                    <li>
                      Access to your data is strictly limited to authorized
                      personnel and is logged.
                    </li>
                    <li>
                      Technical and organizational measures are in place to
                      prevent unauthorized access, loss, or disclosure.
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Your Rights:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You have the right to access, correct, or delete your data
                      at any time.
                    </li>
                    <li>
                      You may withdraw your consent at any time without
                      affecting the lawfulness of prior processing.
                    </li>
                    <li>
                      Upon withdrawal or completion of testing, your data will
                      be securely deleted.
                    </li>
                    <li>
                      You may request data portability or restriction of
                      processing by contacting info@birdiemail.social.
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Data Retention:
                  </h3>
                  <p>
                    Your data will be retained only for the duration of the
                    testing period or until you request deletion, whichever
                    occurs first. In the event that the Application transitions
                    to a full public release, you will be notified in advance
                    and required to review and accept a new set of Terms of
                    Service and Privacy Policy before continuing to use the
                    Application. If you do not accept the updated terms, your
                    data will be securely deleted and your account will be
                    deactivated.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Data Sharing:
                  </h3>
                  <p>
                    Your data will not be shared with third parties except for
                    essential technical service providers (e.g., cloud hosting),
                    who are contractually bound to data protection standards.
                  </p>
                </div>
              </div>
            </section>

            {/* Terms of Use */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Terms of Use
              </h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You agree to use the Application solely for testing and
                    feedback purposes.
                  </li>
                  <li>
                    You must not distribute, modify, reverse engineer, or share
                    the Application or its contents with any third party.
                  </li>
                  <li>
                    You must not use the Application for any unlawful purposes,
                    including but not limited to spamming or unauthorized access
                    to accounts.
                  </li>
                  <li>
                    All intellectual property rights remain with the Application
                    owner.
                  </li>
                </ul>
              </div>
            </section>

            {/* Liability Disclaimer */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Liability Disclaimer
              </h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The Application is provided "as is" without any warranties,
                    express or implied, including but not limited to fitness for
                    a particular purpose, reliability, or availability.
                  </li>
                  <li>
                    The developer is not liable for any direct, indirect,
                    incidental, consequential, or special damages, including but
                    not limited to data loss, service interruption, or security
                    breaches, arising from your use of the Application during
                    testing.
                  </li>
                  <li>
                    You acknowledge that the Application is in a pre-release
                    state and may contain bugs, errors, or vulnerabilities that
                    could affect system performance or data integrity.
                  </li>
                  <li>
                    You are solely responsible for backing up your data and
                    using non-production accounts for testing purposes.
                  </li>
                </ul>
              </div>
            </section>

            {/* Confidentiality */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Confidentiality
              </h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You agree to treat all information about the Application,
                    its features, and any issues discovered as confidential.
                  </li>
                  <li>
                    You may not disclose, discuss, or share any details about
                    the Application or your testing experience with anyone
                    outside the authorized test group without prior written
                    permission from the developer.
                  </li>
                </ul>
              </div>
            </section>

            {/* Feedback Policy */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Feedback Policy
              </h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You are encouraged to provide feedback on features, bugs,
                    and suggestions for improvement.
                  </li>
                  <li>
                    By submitting feedback, you grant the developer the right to
                    use, modify, and incorporate your suggestions into the
                    Application without compensation or attribution.
                  </li>
                  <li>
                    All feedback may be used anonymously for development
                    purposes.
                  </li>
                  <li>
                    If your feedback contains personal data, it will be
                    protected according to the privacy provisions above.
                  </li>
                </ul>
              </div>
            </section>

            {/* Consent and Acceptance */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Consent and Acceptance
              </h2>
              <div className="space-y-4">
                <p>
                  By clicking "I Agree" during registration or by otherwise
                  participating in the test, you confirm that you have read,
                  understood, and accept all terms of this agreement.
                </p>
              </div>
            </section>

            {/* Additional Legal Safeguards */}
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Additional Legal Safeguards
              </h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Consent Logging: Your consent will be recorded (timestamp,
                    method, agreement version).
                  </li>
                  <li>
                    Easy Withdrawal: You may withdraw consent and request data
                    deletion at any time via info@birdiemail.social or the
                    Application interface.
                  </li>
                  <li>
                    Transparency: You will be informed of any significant
                    changes to these terms or data handling practices.
                  </li>
                  <li>
                    Security Best Practices: You are advised not to use real or
                    production email accounts for testing purposes.
                  </li>
                </ul>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t">
              <p className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
