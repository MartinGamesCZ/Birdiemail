"use client";

import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/providers/ThemeProvider";

export default function Page() {
  return (
    <Button variant="primary" size="default" onClick={() => toggleTheme()}>
      Toggle theme
    </Button>
  );
}
