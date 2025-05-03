"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/providers/ThemeProvider";
import {
  MoonIcon,
  SunIcon,
  XMarkIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { IS_DEV } from "@/config";
import { useRouter } from "next/navigation";
import { CommandCenter } from "@/components/command-center";

// Declare ipcRenderer for Electron
declare const ipcRenderer: any;

// Titlebar properties interface
interface TitlebarProps {
  title?: string;
  minimal?: boolean;
}

// Titlebar component for the desktop app
export function Titlebar({ title = "Birdiemail", minimal }: TitlebarProps) {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bind Ctrl+K to open the command center
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };

    // Add event listener for keydown events
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle minimize button click
  const handleMinimize = () => {
    if (typeof ipcRenderer !== "undefined")
      // Send minimize event to the main process
      ipcRenderer.send("win.minimize");
  };

  // Handle maximize/restore button click
  const handleMaximizeRestore = () => {
    if (typeof ipcRenderer !== "undefined") {
      // Send maximize/restore event to the main process
      if (isMaximized) ipcRenderer.send("win.restore");
      else ipcRenderer.send("win.maximize");

      setIsMaximized((prev) => !prev);
    }
  };

  // Handle close button click
  const handleClose = () => {
    // Send close event to the main process
    if (typeof ipcRenderer !== "undefined") ipcRenderer.send("win.close");
    else window.close();
  };

  return (
    <>
      <div className="flex justify-between items-center w-full h-10 max-h-10 bg-white dark:bg-gray-900/10 border-b border-gray-200 dark:border-gray-700/40 select-none">
        <div className="flex items-center pl-6 w-1/4 app-drag-container">
          <span className="font-medium text-md">{title}</span>
        </div>

        {!minimal && (
          <div className="flex justify-center items-center w-2/4 app-drag-container">
            <button
              className="flex items-center px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 w-1/2 no-app-container"
              onClick={() => setIsCommandCenterOpen(true)}
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              <span>Search or type a command</span>
              <kbd className="ml-auto bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs rounded">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        <div className="flex items-center justify-end w-1/4">
          <DevToolsButton />
          <ThemeToggleButton />

          <div className="flex pl-3">
            {!minimal && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none hover:bg-gray-200 dark:hover:bg-gray-700 h-10 w-10"
                  onClick={handleMinimize}
                  title="Minimize"
                >
                  <MinusIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-none hover:bg-gray-200 dark:hover:bg-gray-700 h-10 w-10"
                  onClick={handleMaximizeRestore}
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-none hover:bg-red-500 hover:text-white h-10 w-13 pr-3"
              onClick={handleClose}
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <CommandCenter
        isOpen={isCommandCenterOpen}
        setIsOpen={setIsCommandCenterOpen}
      />
    </>
  );
}

function DevToolsButton() {
  // Use next router for navigation
  const router = useRouter();

  // Don't show the button in production
  if (!IS_DEV) return null;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-none h-10 w-10"
      onClick={() => {
        router.push("/dev");
      }}
      title="Toggle DevTools"
    >
      <WrenchIcon className="h-5 w-5" />
    </Button>
  );
}

function ThemeToggleButton() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle theme toggle button click
  const handleThemeToggle = () => {
    // Toggle the theme and update the state
    toggleTheme();
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    // Check if darkmode is enabled
    const currentTheme = localStorage.getItem("theme");
    setIsDarkMode(currentTheme === "dark");
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-none h-10 w-10"
      onClick={handleThemeToggle}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
