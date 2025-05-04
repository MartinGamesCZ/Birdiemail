import { cn } from "@/lib/utils";
import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function Avatar({
  name,
  size = "md",
  active = false,
  className,
  ...props
}: AvatarProps) {
  // Generate initials from name, handling undefined/null values
  const initials = name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .substring(0, 2)
    : "?";

  // Generate a deterministic color based on the name
  const getColorFromName = (name?: string) => {
    if (!name) return "bg-gray-300 dark:bg-gray-700";

    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    ];

    // Simple hash function to get a consistent number from a string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold uppercase select-none",
        getColorFromName(name),
        sizeClasses[size],
        active &&
          "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-800 dark:ring-offset-gray-900",
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
