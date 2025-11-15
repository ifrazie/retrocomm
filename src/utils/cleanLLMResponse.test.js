import { describe, test, expect } from 'vitest';
import { cleanLLMResponse } from './cleanLLMResponse.js';

describe('cleanLLMResponse', () => {
  // Test single token removal
  test('removes single special token', () => {
    const input = '<|start|>Hello world';
    const expected = 'Hello world';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('removes single token at end', () => {
    const input = 'Hello world<|end|>';
    const expected = 'Hello world';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('removes single token in middle', () => {
    const input = 'Hello<|separator|>world';
    const expected = 'Hello world';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  // Test multiple token removal
  test('removes multiple special tokens', () => {
    const input = '<|channel|>test<|message|>content<|end|>';
    const expected = 'test content';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('removes multiple consecutive tokens', () => {
    const input = '<|start|><|channel|><|message|>Hello';
    const expected = 'Hello';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  // Test preservation of normal text
  test('preserves normal text without tokens', () => {
    const input = 'Normal text without tokens';
    expect(cleanLLMResponse(input)).toBe(input);
  });

  test('preserves text with angle brackets that are not tokens', () => {
    const input = 'Value is <5 and >3';
    expect(cleanLLMResponse(input)).toBe(input);
  });

  test('preserves text with pipes that are not tokens', () => {
    const input = 'Use pipe | for OR operation';
    expect(cleanLLMResponse(input)).toBe(input);
  });

  // Test edge cases
  test('handles empty string', () => {
    expect(cleanLLMResponse('')).toBe('');
  });

  test('handles null', () => {
    expect(cleanLLMResponse(null)).toBe('');
  });

  test('handles undefined', () => {
    expect(cleanLLMResponse(undefined)).toBe('');
  });

  test('handles string with only tokens', () => {
    const input = '<|start|><|end|>';
    expect(cleanLLMResponse(input)).toBe('');
  });

  // Test whitespace normalization
  test('normalizes whitespace after token removal', () => {
    const input = '<|a|>  text  <|b|>  more  <|c|>';
    const result = cleanLLMResponse(input);
    expect(result).toBe('text more');
    expect(result).not.toContain('  '); // No double spaces
  });

  test('trims leading and trailing whitespace', () => {
    const input = '  <|start|>  text  <|end|>  ';
    expect(cleanLLMResponse(input)).toBe('text');
  });

  test('normalizes multiple spaces in original text', () => {
    const input = 'Hello    world';
    expect(cleanLLMResponse(input)).toBe('Hello world');
  });

  // Test real-world token patterns from LLM output
  test('removes <|channel|> token', () => {
    const input = '<|channel|>analysis';
    expect(cleanLLMResponse(input)).toBe('analysis');
  });

  test('removes <|message|> token', () => {
    const input = 'Need to respond<|message|>as pager';
    expect(cleanLLMResponse(input)).toBe('Need to respond as pager');
  });

  test('removes <|end|> token', () => {
    const input = 'Complete response<|end|>';
    expect(cleanLLMResponse(input)).toBe('Complete response');
  });

  test('handles complex real-world example', () => {
    const input = '<|channel|>analysis<|message|>Need to respond as pager. Use caps for emphasis occasionally. Provide greeting, maybe show help.<|end|>';
    const expected = 'analysis Need to respond as pager. Use caps for emphasis occasionally. Provide greeting, maybe show help.';
    expect(cleanLLMResponse(input)).toBe(expected);
  });

  test('handles tokens with various content', () => {
    const input = '<|system|>Hello<|user_input|>world<|assistant_response|>!';
    expect(cleanLLMResponse(input)).toBe('Hello world !');
  });

  test('handles empty tokens', () => {
    const input = '<||>Hello<||>world';
    expect(cleanLLMResponse(input)).toBe('Hello world');
  });

  // Test that non-token patterns are preserved
  test('does not remove incomplete token patterns', () => {
    const input = '<|incomplete';
    expect(cleanLLMResponse(input)).toBe('<|incomplete');
  });

  test('does not remove patterns without closing', () => {
    const input = 'Text with <| but no close';
    expect(cleanLLMResponse(input)).toBe('Text with <| but no close');
  });

  test('preserves HTML-like tags', () => {
    const input = '<div>Hello</div>';
    expect(cleanLLMResponse(input)).toBe('<div>Hello</div>');
  });

  // Test mixed content
  test('handles mixed tokens and normal text', () => {
    const input = 'Start <|token1|> middle <|token2|> end';
    expect(cleanLLMResponse(input)).toBe('Start middle end');
  });

  test('handles numbers in text', () => {
    const input = '<|start|>The answer is 42<|end|>';
    expect(cleanLLMResponse(input)).toBe('The answer is 42');
  });

  test('handles special characters in text', () => {
    const input = '<|start|>Hello! How are you?<|end|>';
    expect(cleanLLMResponse(input)).toBe('Hello! How are you?');
  });

  test('handles newlines in text', () => {
    const input = '<|start|>Line 1\nLine 2<|end|>';
    expect(cleanLLMResponse(input)).toBe('Line 1\nLine 2');
  });

  // Test type coercion
  test('converts number to string', () => {
    expect(cleanLLMResponse(123)).toBe('123');
  });

  test('converts boolean to string', () => {
    expect(cleanLLMResponse(true)).toBe('true');
  });
});
