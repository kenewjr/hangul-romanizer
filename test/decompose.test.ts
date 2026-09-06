import { describe, expect, it } from 'vitest';
import { decomposeHangul, isHangul } from '../src';
import {
  FINALS,
  INITIALS,
  MEDIALS,
  isCompatibilityJamo,
  isPrecomposedHangul,
  toSyllableToken,
} from '../src/decompose';

describe('Hangul decomposition', () => {
  it('exposes all modern table dimensions', () => {
    expect(INITIALS).toHaveLength(19);
    expect(MEDIALS).toHaveLength(21);
    expect(FINALS).toHaveLength(28);
  });

  it('decomposes boundary and representative syllables', () => {
    expect(decomposeHangul('가')).toEqual({
      initial: 'ㄱ',
      medial: 'ㅏ',
      final: '',
    });
    expect(decomposeHangul('각')).toEqual({
      initial: 'ㄱ',
      medial: 'ㅏ',
      final: 'ㄱ',
    });
    expect(decomposeHangul('한')).toEqual({
      initial: 'ㅎ',
      medial: 'ㅏ',
      final: 'ㄴ',
    });
    expect(decomposeHangul('힣')).toEqual({
      initial: 'ㅎ',
      medial: 'ㅣ',
      final: 'ㅎ',
    });
  });

  it('rejects non-precomposed and malformed values', () => {
    expect(decomposeHangul('ㄱ')).toBeNull();
    expect(decomposeHangul('A')).toBeNull();
    expect(decomposeHangul('')).toBeNull();
    expect(decomposeHangul('가나')).toBeNull();
    expect(decomposeHangul('😀')).toBeNull();
  });

  it('recognizes precomposed and full compatibility ranges', () => {
    expect(isHangul('가')).toBe(true);
    expect(isHangul('힣')).toBe(true);
    expect(isHangul('ㄱ')).toBe(true);
    expect(isHangul('ㆎ')).toBe(true);
    expect(isHangul('A')).toBe(false);
    expect(isHangul('')).toBe(false);
    expect(isHangul('가나')).toBe(false);
    expect(isHangul('😀')).toBe(false);
    expect(isPrecomposedHangul('가')).toBe(true);
    expect(isPrecomposedHangul('ㄱ')).toBe(false);
    expect(isPrecomposedHangul('')).toBe(false);
    expect(isPrecomposedHangul(1 as never)).toBe(false);
    expect(isCompatibilityJamo('ㄱ')).toBe(true);
    expect(isCompatibilityJamo('가')).toBe(false);
    expect(isCompatibilityJamo('')).toBe(false);
    expect(isCompatibilityJamo(1 as never)).toBe(false);
    expect(toSyllableToken('한')).toMatchObject({
      original: '한',
      final: 'ㄴ',
    });
    expect(toSyllableToken('A')).toBeNull();
  });

  it('validates utility input types', () => {
    expect(() => decomposeHangul(1 as never)).toThrow(TypeError);
    expect(() => isHangul(null as never)).toThrow(TypeError);
  });
});
