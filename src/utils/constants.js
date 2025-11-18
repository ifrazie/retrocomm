/**
 * Application-wide constants
 * Centralizes magic numbers for better maintainability and documentation
 */

// ============================================================================
// Message Display Limits
// ============================================================================

/**
 * Number of messages shown in pager view (last N messages)
 * Pager displays have limited screen space, so we show only the most recent messages
 */
export const MAX_PAGER_MESSAGES = 5;

/**
 * Number of messages shown in interface lists (PagerInterface component)
 * Balances performance with showing enough history for context
 */
export const MAX_DISPLAY_MESSAGES = 50;

/**
 * Maximum messages kept in memory and localStorage
 * Prevents unbounded memory growth while maintaining sufficient history
 */
export const MAX_STORED_MESSAGES = 100;

/**
 * Maximum fax documents kept in archive
 * Limits memory usage from canvas-rendered fax images
 */
export const MAX_FAX_ARCHIVE = 100;

// ============================================================================
// LLM Configuration
// ============================================================================

/**
 * Maximum tokens for LLM responses
 * Keeps responses concise to fit retro aesthetic and prevent long generation times
 */
export const MAX_LLM_TOKENS = 150;

/**
 * LLM temperature for response generation
 * 0.7 provides a good balance between creativity and coherence
 */
export const LLM_TEMPERATURE = 0.7;

/**
 * Maximum messages in LLM conversation history
 * Limits context window usage while maintaining conversation coherence
 * Actual limit is MAX_CONVERSATION_HISTORY + 1 (includes system prompt)
 */
export const MAX_CONVERSATION_HISTORY = 20;

// ============================================================================
// UI Timing (milliseconds)
// ============================================================================

/**
 * Simulated webhook transmission delay
 * Creates realistic feel for message delivery
 */
export const WEBHOOK_DELAY_MS = 1500;

/**
 * Default toast notification duration
 * Long enough to read but not intrusive
 */
export const TOAST_DURATION_MS = 3000;

/**
 * Duration to show "Copied" feedback after clipboard operation
 * Brief confirmation that action succeeded
 */
export const COPY_FEEDBACK_DURATION_MS = 2000;

/**
 * Maximum username length for registration
 * Prevents excessively long usernames that break UI layout
 */
export const MAX_USERNAME_LENGTH = 20;

/**
 * Duration of fax rendering animation
 * Simulates thermal printer line-by-line printing effect
 */
export const FAX_ANIMATION_DURATION_MS = 2500;

// ============================================================================
// Retry Configuration
// ============================================================================

/**
 * Default number of retry attempts for failed operations
 * Balances reliability with not hanging on permanent failures
 */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Base delay for exponential backoff (milliseconds)
 * First retry after 1s, second after 2s, third after 4s
 */
export const DEFAULT_RETRY_BASE_DELAY = 1000;

// ============================================================================
// Message Constraints
// ============================================================================

/**
 * Maximum characters for pager messages
 * Matches typical pager message length limits from the 1990s
 */
export const MAX_PAGER_MESSAGE_LENGTH = 240;

// ============================================================================
// Application Constants
// ============================================================================

/**
 * Special username for the AI chatbot
 */
export const CHATBOT_USERNAME = 'ChatBot';

/**
 * Interface mode constants
 */
export const MODE_PAGER = 'pager';
export const MODE_FAX = 'fax';
