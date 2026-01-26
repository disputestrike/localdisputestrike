/**
 * Safely parses a JSON string, returning the parsed object or a fallback value on error.
 * This is the server-side equivalent of the client-side utility.
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
    // Handle case where the string itself was a quoted string (e.g., '"parsed"')
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed) as T;
      } catch (e) {
        return fallback;
      }
    }
    return parsed as T;
  } catch (e) {
    console.error("Server Safe JSON Parse failed:", e, "Input:", jsonString);
    return fallback;
  }
}
