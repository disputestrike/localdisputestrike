/**
 * Safely parses a JSON string, returning the parsed object or a fallback value on error.
 * Handles cases where AI returns JSON followed by extra text.
 * @param jsonString The string to parse.
 * @param fallback The value to return if parsing fails.
 * @returns The parsed object or the fallback value.
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  
  let text = jsonString.trim();
  
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed) as T;
      } catch {
        return fallback;
      }
    }
    return parsed as T;
  } catch {
    // Direct parse failed - try to extract JSON object
  }
  
  // AI often returns JSON followed by explanation text
  // Try to extract just the JSON object {...}
  try {
    // Find the first { and try to find matching }
    const startIdx = text.indexOf('{');
    if (startIdx === -1) {
      console.error("[safeJsonParse] No JSON object found in:", text.slice(0, 200));
      return fallback;
    }
    
    // Count braces to find the matching closing brace
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      if (text[i] === '}') braceCount--;
      if (braceCount === 0) {
        endIdx = i;
        break;
      }
    }
    
    if (endIdx === -1) {
      console.error("[safeJsonParse] No matching closing brace found");
      return fallback;
    }
    
    const jsonPart = text.slice(startIdx, endIdx + 1);
    const parsed = JSON.parse(jsonPart);
    console.log("[safeJsonParse] Successfully extracted JSON from mixed content");
    return parsed as T;
  } catch (e) {
    console.error("[safeJsonParse] Failed to extract JSON:", e);
    console.error("[safeJsonParse] Input preview:", text.slice(0, 500));
    return fallback;
  }
}
