"use client";

import { useState, useEffect } from "react";
import { Dock } from "@/components/dock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CogIcon, LinkIcon } from "@heroicons/react/24/outline";
import { checkAppIsDesktop } from "@/utils/desktop/app";

export default function Page() {
  // Link opening preference
  const [openLinksInApp, setOpenLinksInApp] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("openLinksInApp");
    if (savedPreference !== null) {
      setOpenLinksInApp(savedPreference === "true");
    }
  }, []);

  // Save preference to localStorage when changed
  const handleToggleChange = (checked: boolean) => {
    setOpenLinksInApp(checked);
    localStorage.setItem("openLinksInApp", checked.toString());
  };

  return (
    <div className="w-full h-full flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock active="/settings" />

      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="px-6 py-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CogIcon className="w-6 h-6" />
            <CardTitle>Settings</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6 space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Link Preferences
              </h3>

              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="open-in-app">
                      Open Links in App{" "}
                      {!checkAppIsDesktop() && "(Desktop only)"}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      When disabled, links will open in your default browser
                    </div>
                  </div>
                  <Switch
                    id="open-in-app"
                    checked={openLinksInApp}
                    onCheckedChange={handleToggleChange}
                    disabled={!checkAppIsDesktop()}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
