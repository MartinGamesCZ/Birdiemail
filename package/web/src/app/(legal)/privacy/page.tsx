export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            GDPR Compliance Notice
          </h2>
          <p className="text-gray-700">
            Our GDPR compliance documentation is currently being worked on. We
            appreciate your patience as we work to ensure full compliance with
            data protection regulations.
          </p>
        </div>

        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-600 mb-4">
            By using our services, you agree to our current Alpha Tester
            Agreement which outlines how we handle your data.
          </p>

          <p className="text-gray-600 mb-6">
            For more details about your data rights and our practices, please
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
