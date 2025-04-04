import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  noBorderStyling?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  noBorderStyling,
}: CardProps) {
  return (
    <div
      className={`shadow-sm rounded-xl ${
        !noBorderStyling
          ? "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
