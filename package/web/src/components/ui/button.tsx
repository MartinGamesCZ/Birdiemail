import React, { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative dark:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 shadow-sm focus-visible:ring-gray-400",
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm focus-visible:ring-blue-500",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 shadow-sm focus-visible:ring-gray-500",
        outline:
          "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-400",
        ghost:
          "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus-visible:ring-gray-400",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400 p-0 h-auto shadow-none hover:text-blue-800 dark:hover:text-blue-300",
        danger:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm focus-visible:ring-red-500",
        subtle:
          "bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50 focus-visible:ring-blue-400",
        success:
          "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-sm focus-visible:ring-green-500",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        xs: "h-7 px-2 text-xs rounded",
        sm: "h-9 px-3 text-sm rounded",
        lg: "h-11 px-8 text-base rounded-md",
        xl: "h-12 px-10 text-lg rounded-md",
        icon: "h-10 w-10 rounded-full p-0",
        "icon-sm": "h-8 w-8 rounded-full p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

const LoadingSpinner = () => (
  <div className="inline-flex items-center justify-center absolute inset-0 bg-inherit rounded-md">
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        aria-disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">{children}</span>
            <LoadingSpinner />
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="mr-2 -ml-1 inline-flex items-center">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="ml-2 -mr-1 inline-flex items-center">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
