"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

declare const ipcRenderer: any;

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 h-full w-full items-center justify-center">
      <p>Birdiemail Developer tools</p>
      <Button
        variant="primary"
        size="default"
        onClick={() =>
          typeof ipcRenderer != "undefined"
            ? ipcRenderer.send("dev.devtools.open")
            : null
        }
      >
        Open Chrome DevTools (Birdiemail desktop only)
      </Button>
      <Button onClick={() => router.push("/dev/test/components")}>
        Go to component test page
      </Button>
    </div>
  );
}
