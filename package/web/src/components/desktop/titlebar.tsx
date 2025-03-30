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

declare const ipcRenderer: any;

interface TitlebarProps {
  title?: string;
  showWindowControls?: boolean;
}

export const Titlebar = ({
  title = "Birdiemail",
  showWindowControls = true,
}: TitlebarProps) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setIsDarkMode(currentTheme === "dark");

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMinimize = () => {
    if (typeof ipcRenderer !== "undefined") {
      ipcRenderer.send("win.minimize");
    }
  };

  const handleMaximizeRestore = () => {
    if (typeof ipcRenderer !== "undefined") {
      if (isMaximized) {
        ipcRenderer.send("win.restore");
      } else {
        ipcRenderer.send("win.maximize");
      }
      setIsMaximized((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (typeof ipcRenderer !== "undefined") {
      ipcRenderer.send("win.close");
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsDarkMode((prev) => !prev);
  };

  const router = useRouter();

  return (
    <>
      <div className="flex justify-between items-center w-full h-10 max-h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 select-none">
        <div className="flex items-center pl-6 w-1/4 app-drag-container">
          <span className="font-medium text-md">{title}</span>
        </div>

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

        <div className="flex items-center justify-end w-1/4">
          {IS_DEV && (
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
          )}
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
          {showWindowControls && (
            <div className="flex px-3">
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
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-none hover:bg-red-500 hover:text-white h-10 w-10"
                onClick={handleClose}
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <CommandCenter
        isOpen={isCommandCenterOpen}
        setIsOpen={setIsCommandCenterOpen}
      />
    </>
  );
};
