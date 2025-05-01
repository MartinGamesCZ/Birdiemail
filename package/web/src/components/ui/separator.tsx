import React from "react";

interface SeparatorProps {
  /**
   * Optional className to add to the separator
   */
  className?: string;

  /**
   * Orientation of the separator (horizontal by default)
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether the separator should be decorated
   */
  decorative?: boolean;
}

export function Separator({
  className = "",
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const orientationClasses =
    orientation === "horizontal" ? "w-full h-px" : "h-full w-px";

  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={`bg-gray-200 dark:bg-gray-700 ${orientationClasses} ${className}`}
      {...props}
    />
  );
}
