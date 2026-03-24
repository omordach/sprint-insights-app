import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges basic classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('class1', isTrue && 'class2', isFalse && 'class3')).toBe('class1 class2');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('p-4 p-2')).toBe('p-2');
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm text-lg')).toBe('text-lg');
  });

  it('handles arrays and objects', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn({ class1: true, class2: false })).toBe('class1');
  });

  it('handles undefined and null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });

  it('merges complex inputs', () => {
    const isActive = true;
    expect(
      cn(
        'base-class',
        isActive && 'active-class',
        ['array-class-1', 'array-class-2'],
        { 'obj-class-1': true, 'obj-class-2': false },
        'p-4 p-8'
      )
    ).toBe('base-class active-class array-class-1 array-class-2 obj-class-1 p-8');
  });
});
