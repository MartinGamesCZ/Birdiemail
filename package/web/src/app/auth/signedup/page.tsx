"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function SignedUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Image
              src="/birdie_logo_text.png"
              alt="Birdiemail Logo"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-xl font-semibold text-center flex flex-col items-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            Account Created Successfully!
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <EnvelopeIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Verify Your Email</h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400">
                We've sent a verification link to your email address. Please
                check your inbox and click the verification link to activate
                your account.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                If you don't see the email in your inbox, please check your spam
                folder.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/auth/signin" className="w-full block">
                <Button variant="primary" className="w-full">
                  Continue to Sign In
                </Button>
              </Link>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
