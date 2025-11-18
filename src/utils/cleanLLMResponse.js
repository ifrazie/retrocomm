/**
 * Remove LLM special tokens from response text
 * 
 * Special tokens are internal markers used by language models (e.g., <|start|>, <|end|>, <|channel|>, <|message|>)
 * that should be filtered out before displaying to users.
 * 
 * @param {string} text - Raw text from LLM that may contain special tokens
 * @returns {string} Cleaned text with special tokens removed
 * 
 * @example
 * cleanLLMResponse("<|channel|>Hello world<|end|>")
 * // Returns: "Hello world"
 * 
 * @example
 * cleanLLMResponse("Normal text without tokens")
 * // Returns: "Normal text without tokens"
 */
export function cleanLLMResponse(text) {
  // Handle edge cases: null, undefined, or non-string inputs
  if (text == null || text === '') {
    return '';
  }

  // Convert to string if not already
  const textStr = String(text);

  // Pattern: /<\|[^|]*\|>/g
  // - <\| matches literal <|
  // - [^|]* matches any characters except | (zero or more)
  // - \|> matches literal |>
  // - g flag for global matching (all occurrences)
  
  // Replace tokens with a space to prevent word concatenation
  // Then normalize multiple spaces to single space (but preserve newlines)
  const cleaned = textStr
    .replace(/<\|[^|]*\|>/g, ' ')     // Replace tokens with space
    .replace(/[^\S\n]+/g, ' ')        // Normalize spaces (but not newlines) to single space
    .trim();                           // Remove leading/trailing whitespace

  return cleaned;
}
