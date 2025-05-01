import * as React from "react";
import { KeyboardEvent, useState, forwardRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Use the same styling approach as the Input component
const tagInputVariants = cva(
  "flex w-full border bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 dark:ring-offset-gray-950 flex-wrap gap-1",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border-gray-300 dark:border-gray-700 focus-within:ring-blue-500 dark:bg-gray-900 dark:placeholder-gray-400",
        error:
          "rounded-lg border-red-500 focus-within:ring-red-500 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 placeholder-red-400 dark:placeholder-red-300/70",
        success:
          "rounded-lg border-green-500 focus-within:ring-green-500 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 placeholder-green-600 dark:placeholder-green-300/70",
        flushed:
          "border-x-0 border-t-0 border-b-2 rounded-none px-0 focus-within:ring-0 border-gray-300 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 dark:bg-gray-900",
        filled:
          "rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus-within:bg-white dark:focus-within:bg-gray-900 border-2 border-transparent focus-within:border-blue-500/50 dark:focus-within:border-blue-400/50",
      },
      size: {
        default: "min-h-10",
        sm: "min-h-8 px-2 text-xs rounded",
        lg: "min-h-12 px-4 text-base",
        xl: "min-h-14 px-5 text-lg",
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

// Tag styling
const tagVariants = cva(
  "flex items-center gap-1 rounded-md px-2 py-0.5 text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
        error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100",
        success:
          "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TagInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "value" | "onChange"
    >,
    VariantProps<typeof tagInputVariants> {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isRequired?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      disabled,
      isRequired,
      tags,
      setTags,
      placeholder,
      onTagAdd,
      onTagRemove,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = useState("");
    const inputVariant = errorText ? "error" : variant;
    const tagVariant = errorText ? "error" : "default";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Add new tag on Enter, comma, or space
      if (e.key === "Enter" || e.key === "," || e.key === " ") {
        e.preventDefault();
        addTag();
      }
    };

    const addTag = () => {
      // Extract email addresses from input
      const newTags = input
        .split(/[,\s]+/)
        .filter((tag) => tag.trim() && !tags.includes(tag.trim()));

      if (newTags.length > 0) {
        const updatedTags = [...tags, ...newTags];
        setTags(updatedTags);
        setInput("");

        // Call the onTagAdd callback for each new tag if provided
        if (onTagAdd) {
          newTags.forEach((tag) => onTagAdd(tag));
        }
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));

      // Call the onTagRemove callback if provided
      if (onTagRemove) {
        onTagRemove(tagToRemove);
      }
    };

    const handleBlur = () => {
      if (input.trim()) {
        addTag();
      }
    };

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
          <div
            className={cn(
              tagInputVariants({ variant: inputVariant, size, fullWidth }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
              errorText && "animate-shake"
            )}
          >
            {tags.map((tag, index) => (
              <div key={index} className={tagVariants({ variant: tagVariant })}>
                <span>{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    disabled={disabled}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="flex-1 min-w-[120px] outline-none bg-transparent"
              placeholder={tags.length === 0 ? placeholder : ""}
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
              required={isRequired && tags.length === 0}
              {...props}
            />
          </div>
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
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

TagInput.displayName = "TagInput";

export { TagInput, tagInputVariants, tagVariants };
