"use client";

import { Titlebar } from "@/components/desktop/titlebar";
import { useEffect, useState } from "react";

declare const appIsElectron: boolean;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") : "light"
  );

  useEffect(() => {
    if (typeof appIsElectron === "boolean") {
      setIsElectron(appIsElectron);
    }
  }, []);

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
        "dark:bg-black bg-white text-gray-900 dark:text-gray-100 w-screen h-screen overflow-hidden transition-colors theme-provider " +
        theme
      }
      suppressHydrationWarning
    >
      {isElectron && <Titlebar />}
      <div suppressHydrationWarning className={isElectron ? "hwt" : "h-screen"}>
        {children}
      </div>
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

export function setTheme(theme: "dark" | "light") {
  localStorage.setItem("theme", theme);
  document
    .querySelector(".theme-provider")!
    .classList.toggle("dark", theme === "dark");
}

export function getTheme() {
  return localStorage.getItem("theme") || "light";
}
