"use client";

import { Dock } from "@/components/dock";
import Mailbox from "@/components/mailbox";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="w-screen h-screen flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock />
      <Mailbox />
      <Card className="flex-1 p-0">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Message View</h1>
          <div className="flex gap-3">
            <Button>Archive</Button>
            <Button variant="primary">Reply</Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <div className="text-gray-500 dark:text-gray-400 text-center mt-40">
            Select a message to view its contents
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
