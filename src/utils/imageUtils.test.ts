/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { optimizeImage } from './imageUtils';

describe('optimizeImage utility', () => {
  it('should be a function', () => {
    expect(typeof optimizeImage).toBe('function');
  });

  // Note: Testing Canvas/FileReader in Vitest/JSDOM requires more setup,
  // but we can at least verify the function signature and basic presence.
  it('returns a promise', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = optimizeImage(mockFile);
    expect(result).toBeInstanceOf(Promise);
  });
});
