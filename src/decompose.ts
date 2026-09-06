import type { DecomposedHangul, SyllableToken } from './types';

export const INITIALS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const;

export const MEDIALS = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
] as const;

export const FINALS = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const;

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const COMPATIBILITY_JAMO_BASE = 0x3131;
const COMPATIBILITY_JAMO_END = 0x318e;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;
const INITIAL_BLOCK_SIZE = MEDIAL_COUNT * FINAL_COUNT;

function oneCodePoint(value: string): string | null {
  const characters = Array.from(value);
  return characters.length === 1 ? (characters[0] ?? null) : null;
}

/**
 * Return whether `char` is one precomposed Hangul syllable or one character
 * from the Hangul Compatibility Jamo block.
 */
export function isHangul(char: string): boolean {
  if (typeof char !== 'string') {
    throw new TypeError('char must be a string');
  }

  const character = oneCodePoint(char);
  if (character === null) return false;
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return false;

  return (
    (codePoint >= HANGUL_BASE && codePoint <= HANGUL_END) ||
    (codePoint >= COMPATIBILITY_JAMO_BASE &&
      codePoint <= COMPATIBILITY_JAMO_END)
  );
}

/** Return whether `char` is one modern precomposed Hangul syllable. */
export function isPrecomposedHangul(char: string): boolean {
  if (typeof char !== 'string') return false;
  const character = oneCodePoint(char);
  if (character === null) return false;
  const codePoint = character.codePointAt(0);
  return (
    codePoint !== undefined &&
    codePoint >= HANGUL_BASE &&
    codePoint <= HANGUL_END
  );
}

/** Return whether `char` belongs to the Hangul Compatibility Jamo block. */
export function isCompatibilityJamo(char: string): boolean {
  if (typeof char !== 'string') return false;
  const character = oneCodePoint(char);
  if (character === null) return false;
  const codePoint = character.codePointAt(0);
  return (
    codePoint !== undefined &&
    codePoint >= COMPATIBILITY_JAMO_BASE &&
    codePoint <= COMPATIBILITY_JAMO_END
  );
}

/**
 * Decompose one modern precomposed Hangul syllable into initial, medial, and
 * final compatibility jamo. Returns `null` for every other input.
 */
export function decomposeHangul(char: string): DecomposedHangul | null {
  if (typeof char !== 'string') {
    throw new TypeError('char must be a string');
  }

  const character = oneCodePoint(char);
  if (character === null) return null;
  const codePoint = character.codePointAt(0);
  if (
    codePoint === undefined ||
    codePoint < HANGUL_BASE ||
    codePoint > HANGUL_END
  ) {
    return null;
  }

  const syllableIndex = codePoint - HANGUL_BASE;
  const initialIndex = Math.floor(syllableIndex / INITIAL_BLOCK_SIZE);
  const medialIndex = Math.floor(
    (syllableIndex % INITIAL_BLOCK_SIZE) / FINAL_COUNT,
  );
  const finalIndex = syllableIndex % FINAL_COUNT;
  const initial = INITIALS[initialIndex];
  const medial = MEDIALS[medialIndex];
  const final = FINALS[finalIndex];

  if (initial === undefined || medial === undefined || final === undefined) {
    return null;
  }

  return { initial, medial, final };
}

/** Build an internal pronunciation token from one precomposed syllable. */
export function toSyllableToken(char: string): SyllableToken | null {
  const decomposed = decomposeHangul(char);
  return decomposed === null
    ? null
    : {
        original: char,
        ...decomposed,
        inducedTense: false,
        inducedAspiration: false,
      };
}
