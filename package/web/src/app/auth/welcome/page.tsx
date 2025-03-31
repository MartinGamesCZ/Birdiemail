"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getTheme, setTheme, toggleTheme } from "@/providers/ThemeProvider";

export default function WelcomePage() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const handleThemeSelection = (selectedTheme: "light" | "dark") => {
    setThemeState(selectedTheme);
    setTheme(selectedTheme);
  };

  useEffect(() => {
    if (typeof window == "undefined") return;

    const currentTheme = getTheme();

    setThemeState(currentTheme as "dark" | "light");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Birdiemail!
          </h1>
          <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
            Thank you for joining us. Let's personalize your experience.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="text-xl font-semibold text-center">
            Choose your theme
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Select your preferred appearance for the application.
            </p>
            <div className="flex gap-4">
              <Button
                variant={theme === "light" ? "primary" : "outline"}
                onClick={() => handleThemeSelection("light")}
                className="flex-1 flex items-center justify-center gap-2 py-4"
                size="lg"
              >
                <SunIcon className="h-6 w-6" />
                <span className="font-medium">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "primary" : "outline"}
                onClick={() => handleThemeSelection("dark")}
                className="flex-1 flex items-center justify-center gap-2 py-4"
                size="lg"
              >
                <MoonIcon className="h-6 w-6" />
                <span className="font-medium">Dark</span>
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              You can always change this later in settings.
            </p>

            <Link href="/app/inbox" className="block w-full mt-6">
              <Button variant="primary" size="lg" className="w-full">
                Continue to setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
