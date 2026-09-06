import type { SyllablePair, SyllableToken } from '../types';

const SIMPLE_FINAL_TO_INITIAL: Readonly<Record<string, string>> = {
  ㄱ: 'ㄱ',
  ㄲ: 'ㄲ',
  ㄴ: 'ㄴ',
  ㄷ: 'ㄷ',
  ㄹ: 'ㄹ',
  ㅁ: 'ㅁ',
  ㅂ: 'ㅂ',
  ㅅ: 'ㅅ',
  ㅆ: 'ㅆ',
  ㅈ: 'ㅈ',
  ㅊ: 'ㅊ',
  ㅋ: 'ㅋ',
  ㅌ: 'ㅌ',
  ㅍ: 'ㅍ',
};

const COMPOUND_SPLIT: Readonly<Record<string, readonly [string, string]>> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
};

/** Move a final consonant into a following vowel-initial syllable. */
export function applyLiaison(
  left: SyllableToken,
  right: SyllableToken,
): SyllablePair {
  const previous = { ...left };
  const next = { ...right };
  if (
    next.initial !== 'ㅇ' ||
    previous.final === '' ||
    previous.final === 'ㅇ'
  ) {
    return [previous, next];
  }

  const split = COMPOUND_SPLIT[previous.final];
  if (split !== undefined) {
    previous.final = split[0];
    next.initial = split[1];
    return [previous, next];
  }

  const moved = SIMPLE_FINAL_TO_INITIAL[previous.final];
  if (moved !== undefined) {
    previous.final = '';
    next.initial = moved;
  }

  return [previous, next];
}
