import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "gray";
  fullScreen?: boolean;
  className?: string;
}

export function Spinner({
  size = "md",
  color = "primary",
  fullScreen = false,
  className,
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    primary:
      "border-blue-600 border-t-transparent dark:border-blue-500 dark:border-t-transparent",
    secondary:
      "border-gray-600 border-t-transparent dark:border-gray-400 dark:border-t-transparent",
    gray: "border-gray-300 border-t-transparent dark:border-gray-600 dark:border-t-transparent",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
