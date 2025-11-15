# Design Document

## Overview

This design implements a filtering mechanism to remove LLM special tokens from chatbot responses before they are displayed to users. The solution uses a regular expression-based utility function that can be applied consistently across the application.

## Architecture

### Component Interaction Flow

```
LLM Model
    ↓ (generates response with special tokens)
LLMChatbotService.generateResponse()
    ↓ (receives raw response)
cleanLLMResponse() utility
    ↓ (filters special tokens)
Clean Response
    ↓ (returns to caller)
UI Components (PagerInterface/FaxInterface)
    ↓ (displays clean text)
User sees clean message
```

## Components and Interfaces

### 1. Utility Function: `cleanLLMResponse`

**Location:** `src/utils/cleanLLMResponse.js`

**Purpose:** Provides a pure function to remove special token patterns from LLM-generated text.

**Interface:**
```javascript
/**
 * Remove LLM special tokens from response text
 * @param {string} text - Raw text from LLM that may contain special tokens
 * @returns {string} Cleaned text with special tokens removed
 */
export function cleanLLMResponse(text)
```

**Implementation Details:**
- Uses regular expression to match patterns: `<|...|>`
- Pattern: `/<\|[^|]*\|>/g`
  - `<\|` - Matches literal `<|`
  - `[^|]*` - Matches any characters except `|` (zero or more)
  - `\|>` - Matches literal `|>`
  - `g` flag - Global matching (all occurrences)
- Returns trimmed result to remove any extra whitespace
- Handles edge cases:
  - Empty strings → returns empty string
  - Null/undefined → returns empty string
  - No tokens present → returns original text unchanged

### 2. Service Integration: `LLMChatbotService`

**Location:** `src/services/LLMChatbotService.js`

**Modifications:**
- Import `cleanLLMResponse` utility
- Apply filtering in `generateResponse()` method after receiving LLM output
- Apply filtering in `getFallbackResponse()` method (defensive programming)

**Integration Points:**

```javascript
// In generateResponse() method
async generateResponse(userMessage) {
  // ... existing code to get response ...
  
  // Apply token filtering before returning
  const cleanedResponse = cleanLLMResponse(responseContent.trim());
  
  return cleanedResponse;
}

// In getFallbackResponse() method
getFallbackResponse(userMessage) {
  // ... existing code ...
  
  // Apply filtering to fallback responses too
  return cleanLLMResponse(response);
}
```

### 3. Test Suite: `cleanLLMResponse.test.js`

**Location:** `src/utils/cleanLLMResponse.test.js`

**Test Cases:**
1. **Single token removal**: Verify `<|start|>` is removed
2. **Multiple tokens removal**: Verify multiple tokens in one string are all removed
3. **Mixed content**: Verify normal text is preserved while tokens are removed
4. **No tokens**: Verify text without tokens passes through unchanged
5. **Edge cases**: Empty string, null, undefined, whitespace handling
6. **Real-world patterns**: Test actual patterns seen in LLM output like `<|channel|>`, `<|message|>`, `<|end|>`

## Data Models

### Input/Output Contract

**Input:** Raw LLM response string
```
"<|channel|>analysis<|message|>Need to respond as pager. Use caps for emphasis occasionally. Provide greeting, maybe show help.<|end|>"
```

**Output:** Cleaned response string
```
"analysisNeed to respond as pager. Use caps for emphasis occasionally. Provide greeting, maybe show help."
```

**Note:** The example shows that tokens are removed but words may run together. The design accounts for this by:
- Replacing tokens with a space character instead of empty string
- Trimming and normalizing whitespace in the result

**Improved Pattern:**
```javascript
// Replace with space to prevent word concatenation
text.replace(/<\|[^|]*\|>/g, ' ')
    .replace(/\s+/g, ' ')  // Normalize multiple spaces
    .trim();
```

## Error Handling

### Defensive Programming

1. **Null/Undefined Input:**
   - Check for falsy values at function entry
   - Return empty string for null/undefined
   - Prevents runtime errors

2. **Invalid Regex:**
   - Use tested, static regex pattern
   - No user input in regex construction
   - No risk of ReDoS (Regular Expression Denial of Service)

3. **Service Integration:**
   - Wrap filtering in try-catch in service
   - Log errors in development mode
   - Return unfiltered text if filtering fails (graceful degradation)

```javascript
try {
  return cleanLLMResponse(responseContent);
} catch (error) {
  if (isDevelopment) {
    console.error('Error cleaning LLM response:', error);
  }
  return responseContent; // Return original if cleaning fails
}
```

## Testing Strategy

### Unit Tests

**File:** `src/utils/cleanLLMResponse.test.js`

**Framework:** Vitest

**Test Structure:**
```javascript
describe('cleanLLMResponse', () => {
  test('removes single special token', () => {
    const input = '<|start|>Hello world';
    const expected = 'Hello world';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('removes multiple special tokens', () => {
    const input = '<|channel|>test<|message|>content<|end|>';
    const expected = 'test content';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('preserves normal text', () => {
    const input = 'Normal text without tokens';
    expect(cleanLLMResponse(input)).toBe(input);
  });

  test('handles empty string', () => {
    expect(cleanLLMResponse('')).toBe('');
  });

  test('handles null and undefined', () => {
    expect(cleanLLMResponse(null)).toBe('');
    expect(cleanLLMResponse(undefined)).toBe('');
  });

  test('normalizes whitespace', () => {
    const input = '<|a|>  text  <|b|>  more  <|c|>';
    const result = cleanLLMResponse(input);
    expect(result).not.toContain('  '); // No double spaces
  });
});
```

### Integration Testing

**Manual Testing Steps:**
1. Start LM Studio with a model loaded
2. Send test messages that trigger special tokens
3. Verify pager display shows clean text
4. Check browser console for any errors
5. Test both pager and fax modes

**Test Messages:**
- "Hello" (simple greeting)
- "What time is it?" (command-like)
- "Tell me a story" (longer response)

### Performance Considerations

**Regex Performance:**
- Simple pattern with no backtracking
- O(n) complexity where n is string length
- Negligible overhead for typical message sizes (< 1000 chars)

**Memory:**
- Creates one new string per response
- No memory leaks (no closures or event listeners)
- Garbage collected immediately after use

## Implementation Notes

### File Structure

```
src/
├── utils/
│   ├── cleanLLMResponse.js       (new file)
│   └── cleanLLMResponse.test.js  (new file)
└── services/
    └── LLMChatbotService.js      (modified)
```

### Import Statements

**In LLMChatbotService.js:**
```javascript
import { cleanLLMResponse } from '../utils/cleanLLMResponse.js';
```

### Backward Compatibility

- No breaking changes to existing APIs
- Service interface remains unchanged
- Existing code continues to work
- Filtering is transparent to consumers

## Alternative Approaches Considered

### 1. Filter in UI Components
**Rejected:** Would require changes in multiple components (PagerInterface, FaxInterface). Violates DRY principle.

### 2. Configure LLM to Not Generate Tokens
**Rejected:** Not all models support this configuration. Some tokens are inherent to model architecture.

### 3. Post-process in Hook
**Rejected:** Hook is just a wrapper around service. Better to filter at source (service layer).

### 4. Use String Replace Instead of Regex
**Rejected:** Would need to know all possible token patterns in advance. Regex is more flexible and maintainable.

## Security Considerations

- No user input in regex pattern (no injection risk)
- No eval or dynamic code execution
- Pure function with no side effects
- No external dependencies

## Accessibility

- Filtering improves readability for all users
- Screen readers will read cleaner text
- No visual-only changes (text-based filtering)

## Future Enhancements

1. **Configurable Patterns:** Allow custom token patterns via config
2. **Logging:** Track which tokens are being filtered for debugging
3. **Metrics:** Count filtered tokens for monitoring
4. **Whitelist:** Option to preserve certain tokens if needed
