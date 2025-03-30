import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const inputVariants = cva(
  "flex w-full border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 dark:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500 dark:bg-gray-900 dark:placeholder-gray-400",
        error:
          "rounded-lg border-red-500 focus-visible:ring-red-500 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 placeholder-red-400 dark:placeholder-red-300/70",
        success:
          "rounded-lg border-green-500 focus-visible:ring-green-500 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 placeholder-green-600 dark:placeholder-green-300/70",
        flushed:
          "border-x-0 border-t-0 border-b-2 rounded-none px-0 focus-visible:ring-0 border-gray-300 dark:border-gray-700 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 dark:bg-gray-900",
        filled:
          "rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus-visible:bg-white dark:focus-visible:bg-gray-900 border-2 border-transparent focus-visible:border-blue-500/50 dark:focus-visible:border-blue-400/50",
      },
      size: {
        default: "h-10",
        sm: "h-8 px-2 text-xs rounded",
        lg: "h-12 px-4 text-base",
        xl: "h-14 px-5 text-lg",
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  isRequired?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      type = "text",
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      disabled,
      isRequired,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const inputVariant = errorText ? "error" : variant;

    return (
      <div className={cn("space-y-2", fullWidth ? "w-full" : "")}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: inputVariant, size, fullWidth }),
              leftIcon && "pl-10",
              (rightIcon || (isPassword && showPasswordToggle)) && "pr-10",
              className,
              errorText && "animate-shake"
            )}
            disabled={disabled}
            ref={ref}
            aria-invalid={!!errorText}
            aria-describedby={
              errorText
                ? `${props.id}-error`
                : helperText
                ? `${props.id}-helper`
                : undefined
            }
            required={isRequired}
            {...props}
          />
          {(rightIcon || (isPassword && showPasswordToggle)) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-full p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {helperText && !errorText && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            id={props.id ? `${props.id}-helper` : undefined}
          >
            {helperText}
          </p>
        )}
        {errorText && (
          <p
            className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1"
            id={props.id ? `${props.id}-error` : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
