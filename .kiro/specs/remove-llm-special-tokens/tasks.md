# Implementation Plan

- [x] 1. Create utility function for cleaning LLM responses





  - Create `src/utils/cleanLLMResponse.js` with regex-based token removal function
  - Implement pattern `/<\|[^|]*\|>/g` to match special tokens
  - Replace tokens with space and normalize whitespace
  - Handle edge cases (null, undefined, empty string)
  - Export function for use in other modules
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.1 Write unit tests for cleanLLMResponse utility


  - Create `src/utils/cleanLLMResponse.test.js` test file
  - Test single token removal
  - Test multiple token removal
  - Test preservation of normal text
  - Test edge cases (empty, null, undefined)
  - Test whitespace normalization
  - Test real-world token patterns from LLM output
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Integrate token filtering into LLMChatbotService





  - Import `cleanLLMResponse` utility in `src/services/LLMChatbotService.js`
  - Apply filtering in `generateResponse()` method after receiving LLM output
  - Apply filtering in `getFallbackResponse()` method for consistency
  - Add try-catch error handling around filtering with graceful degradation
  - Add development mode logging for debugging
  - _Requirements: 1.1, 1.5_

- [ ] 3. Verify integration and test end-to-end




  - Start development server and LM Studio
  - Send test messages through pager interface
  - Verify special tokens are removed from displayed messages
  - Check browser console for any errors
  - Test both streaming and non-streaming responses
  - Verify fallback responses also have tokens removed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
