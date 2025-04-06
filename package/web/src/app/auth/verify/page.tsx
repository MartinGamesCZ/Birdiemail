"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { trpc } from "@/server/trpc";

export default function VerificationPage() {
  const searchParams = useSearchParams();
  const verificationCode = searchParams.get("code");

  const router = useRouter();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!verificationCode) {
      setVerificationStatus("error");
      setErrorMessage("Missing verification code");
      return;
    }

    (async () => {
      const res = await trpc.userRouter.verify.mutate({
        key: verificationCode,
      });

      if (res.status === "error") {
        setVerificationStatus("error");
        setErrorMessage(res.message);
        return;
      }

      setVerificationStatus("success");
    })();
  }, [verificationCode]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Birdiemail
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mail client of the future
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-pulse">
                  <ShieldCheckIcon className="h-16 w-16 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold">
                  Verifying your account...
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  This will only take a moment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Birdiemail
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mail client of the future
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-xl font-semibold text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              Verification Failed
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {errorMessage ||
                  "We couldn't verify your account. The verification link may have expired or is invalid."}
              </p>

              <div className="space-y-4">
                <Link href="/auth/signup" className="w-full block">
                  <Button variant="outline" className="w-full">
                    Try Signing Up Again
                  </Button>
                </Link>

                <Link href="/auth/signin" className="w-full block">
                  <Button variant="primary" className="w-full">
                    Go to Sign In
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Birdiemail
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Mail client of the future
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-xl font-semibold text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            Account Verified Successfully!
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Your email has been verified and your account is now active. You
                can now sign in to access your Birdiemail account.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Welcome to Birdiemail! You're all set to start using our
                services.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/auth/signin" className="w-full block">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center"
                >
                  <span>Sign In</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
