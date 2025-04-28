"use client";

import { Titlebar } from "@/components/desktop/titlebar";
import { checkAppIsDesktop } from "@/utils/desktop/app";
import { useEffect, useState } from "react";

// Theme provider component for light/dark mode
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") : "light"
  );

  useEffect(() => {
    // Check if the app is running in Electron and set the state
    setIsElectron(checkAppIsDesktop());
  }, []);

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window == "undefined") return;

    // Retrieve the saved theme from local storage
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
      // Set the theme to dark mode (uses tailwindcss styles)
      document.querySelector(".theme-provider")!.classList.add("dark");
      setTheme("dark");
    } else {
      // Set the theme to light mode (uses tailwindcss styles)
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
      {/* If the app is running in Electron, render the title bar */}
      {isElectron && <Titlebar />}
      <div suppressHydrationWarning className={isElectron ? "hwt" : "h-screen"}>
        {children}
      </div>
    </div>
  );
}

// Function to toggle between light and dark themes
export function toggleTheme() {
  // Retrieve the current theme from local storage
  const currentTheme = localStorage.getItem("theme");

  // Set and save the new theme
  if (currentTheme === "dark") {
    localStorage.setItem("theme", "light");
    document.querySelector(".theme-provider")!.classList.remove("dark");
  } else {
    localStorage.setItem("theme", "dark");
    document.querySelector(".theme-provider")!.classList.add("dark");
  }
}

// Function to set the theme directly
export function setTheme(theme: "dark" | "light") {
  // Set and save the new theme
  localStorage.setItem("theme", theme);
  document
    .querySelector(".theme-provider")!
    .classList.toggle("dark", theme === "dark");
}

// Function to get the current theme
export function getTheme() {
  // Retrieve the current theme from local storage
  // If not found, return "light" as default
  return localStorage.getItem("theme") || "light";
}
