// Runtime validation coverage for: finance display formatting and categories
import { describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatCurrency,
  getCategoryById,
} from './constants.js';

describe('finance display formatting', () => {
  it('formats currency with the selected currency code', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(1234.5, 'EUR')).toBe('€1,234.50');
  });

  it('formats chart values compactly', () => {
    expect(formatCompactCurrency(12500)).toBe('$12.5K');
  });

  it('treats non-numeric values as zero', () => {
    expect(formatCurrency('not-a-number')).toBe('$0.00');
  });
});

describe('transaction categories', () => {
  it('returns a known category by its identifier', () => {
    expect(getCategoryById('food').label).toBe('Food & Dining');
  });

  it('provides a safe label for unknown categories', () => {
    expect(getCategoryById('custom-category')).toMatchObject({
      id: 'custom-category',
      label: 'custom-category',
    });
  });
});
