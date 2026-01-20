import { describe, it, expect } from 'vitest';
import { hello } from './hello';

describe('hello', () => {
  describe('should return greeting', () => {
    it('should return "Hello, World!" when called without arguments', () => {
      const result = hello();
      expect(result).toBe('Hello, World!');
    });

    it('should return "Hello, Alice!" when called with "Alice"', () => {
      const result = hello('Alice');
      expect(result).toBe('Hello, Alice!');
    });

    it('should return "Hello, Bob!" when called with "Bob"', () => {
      const result = hello('Bob');
      expect(result).toBe('Hello, Bob!');
    });
  });

  describe('should handle edge cases', () => {
    it('should return "Hello, World!" when called with empty string', () => {
      const result = hello('');
      expect(result).toBe('Hello, World!');
    });
  });
});
