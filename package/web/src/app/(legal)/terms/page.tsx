export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Terms of Service
        </h1>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Early Access Notice
          </h2>
          <p className="text-gray-700">
            Our service is currently in early access. These terms may be updated
            as our service evolves. We'll notify users of significant changes to
            these terms.
          </p>
        </div>

        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-600 mb-4">
            By using our services, you agree to abide by these Terms of Service
            and our Alpha Tester Agreement.
          </p>

          <p className="text-gray-600 mb-6">
            For complete details about your rights and obligations, please
            review our
            <a
              href="/temp/alpha-tester-agreement"
              className="text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              Alpha Tester Agreement
            </a>
            .
          </p>

          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
