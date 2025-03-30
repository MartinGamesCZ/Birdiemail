"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") : "light"
  );

  useEffect(() => {
    if (typeof window == "undefined") return;

    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
      document.querySelector(".theme-provider")!.classList.add("dark");
      setTheme("dark");
    } else {
      document.querySelector(".theme-provider")!.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  return (
    <div
      className={
        "dark:bg-black bg-white text-gray-900 dark:text-gray-100 w-screen h-screen transition-colors theme-provider " +
        theme
      }
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

export function toggleTheme() {
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    localStorage.setItem("theme", "light");
    document.querySelector(".theme-provider")!.classList.remove("dark");
  } else {
    localStorage.setItem("theme", "dark");
    document.querySelector(".theme-provider")!.classList.add("dark");
  }
}
