import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a JSON string, returning the parsed object or a fallback value on error.
 * @param jsonString The string to parse.
 * @param fallback The value to return if parsing fails.
 * @returns The parsed object or the fallback value.
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  try {
    const parsed = JSON.parse(jsonString);
    // Check if the parsed result is a string (which happens when the original string was just a quoted string, e.g., '"parsed"')
    if (typeof parsed === 'string') {
      // Attempt to parse again if it's a quoted string that might contain JSON
      try {
        return JSON.parse(parsed) as T;
      } catch (e) {
        // If it still fails, return the fallback
        return fallback;
      }
    }
    return parsed as T;
  } catch (e) {
    console.error("Safe JSON Parse failed:", e, "Input:", jsonString);
    return fallback;
  }
}
