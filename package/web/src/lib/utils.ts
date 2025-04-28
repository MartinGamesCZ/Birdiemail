import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
