"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaBug,
  FaDiscord,
  FaHandshake,
  FaClipboardList,
  FaUsers,
  FaHeadset,
} from "react-icons/fa";

export default function AlphaTestingPage() {
  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-100 to-indigo-50 opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Welcome to <span className="text-blue-600">Birdiemail</span>{" "}
              Alpha!
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              You're among the first to experience our platform. We're thrilled
              to have you join us on this journey!
            </p>
            <p className="text-lg text-blue-500 max-w-2xl mx-auto mb-8">
              Scroll down to learn more!
            </p>
          </div>
        </div>

        {/* Abstract shapes decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
          <div className="w-64 h-64 rounded-full bg-blue-200 opacity-20"></div>
        </div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 hidden lg:block">
          <div className="w-40 h-40 rounded-full bg-indigo-200 opacity-20"></div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaHandshake className="text-blue-500 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Invitation
                </h2>
              </div>
              <p className="text-gray-600">
                Congratulations on being selected as an alpha tester for
                Birdiemail! Your feedback will directly shape the future of our
                platform. As an early adopter, you'll get exclusive access to
                features before they're publicly available. We encourage you to
                explore the app, test its features, and share your thoughts with
                us. You can and probably will break things, and that's okay!
                Also, please remember that we wanted to give you access to the
                app as soon as possible, so the app is very unpolished and work
                in progress.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 p-3 rounded-full mr-4">
                  <FaClipboardList className="text-amber-500 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Known Issues
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                We're actively working on improving Birdiemail. Here are some
                issues you might encounter:
              </p>
              <ul className="list-disc pl-10 text-gray-600 space-y-2">
                <li>
                  It's very slow, we are working towards greatly improving the
                  speed
                </li>
                <li>
                  It's very unstable and often crashes, we are working on it
                </li>
                <li>
                  Very unresponsive on non-standard pc monitors and all mobile
                  devices
                </li>
                <li>
                  Pretty bad UX, let's be honest. We are really working on
                  polishing it
                </li>
                <li>Missing a lot of features</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <FaBug className="text-red-500 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Reporting Bugs & Getting Help
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Your feedback is invaluable to us. Here's how you can report
                issues and get assistance:
              </p>
              <ul className="list-disc pl-10 text-gray-600 space-y-2">
                <li>Join our Discord community for real-time support</li>
                <li>
                  Include screenshots and steps to reproduce any bugs you find
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaUsers className="text-green-500 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Role as an Alpha Tester
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                As an alpha tester, you play a crucial role in Birdiemail's
                development:
              </p>
              <ul className="list-disc pl-10 text-gray-600 space-y-2">
                <li>Use the application regularly and explore all features</li>
                <li>Provide honest feedback about your experience</li>
                <li>Report any bugs or inconsistencies you encounter</li>
                <li>Suggest improvements or new features</li>
                <li>
                  Help us understand how real users interact with Birdiemail
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Section - Full Width */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-10 md:p-16 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white bg-opacity-20 rounded-full mb-8">
              <FaDiscord className="text-indigo-500 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Community
            </h2>
            <p className="text-white text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Connect with other testers and our development team. Get real-time
              assistance, share your experience, and help shape the future of
              Birdiemail.
            </p>
            <a
              href="https://discord.gg/AaZCTHNaWZ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-full text-indigo-600 bg-white hover:bg-opacity-90 transition-all"
            >
              <FaDiscord className="mr-2" />
              Join Birdiemail Discord
            </a>
          </div>
        </div>

        {/* Alpha Terms & Thank You */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-8 mb-16">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Alpha Testing Terms
            </h2>
            <p className="text-gray-600">
              By participating in this alpha test, you acknowledge that you're
              using pre-release software that may contain bugs. You agree to
              provide feedback and understand that features may change before
              final release. You also agree to our{" "}
              <Link
                href="/temp/alpha-tester-agreement"
                className="text-blue-600 hover:underline"
              >
                Alpha Tester Agreement
              </Link>
              .
            </p>
          </div>

          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-yellow-100 rounded-full mb-4">
              <FaHeadset className="text-yellow-500 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your participation helps make Birdiemail better for everyone.
              We're grateful for your time, feedback, and enthusiasm.
            </p>
          </div>

          <div className="text-center pb-20">
            <Link
              href="https://github.com/MartinGamesCZ/Birdiemail/releases/tag/0.1.0-alpha.1"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Download app
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
