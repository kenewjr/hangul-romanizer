import type { SyllablePair, SyllableToken } from '../types';

const ASPIRATED_ONSET: Readonly<Record<string, string>> = {
  ㄱ: 'ㅋ',
  ㄷ: 'ㅌ',
  ㅂ: 'ㅍ',
  ㅈ: 'ㅊ',
};

const H_COMPOUND_REMAINDER: Readonly<Record<string, string>> = {
  ㄶ: 'ㄴ',
  ㅀ: 'ㄹ',
};

const BEFORE_H: Readonly<Record<string, readonly [string, string]>> = {
  ㄱ: ['', 'ㅋ'],
  ㄲ: ['', 'ㅋ'],
  ㄳ: ['', 'ㅋ'],
  ㅋ: ['', 'ㅋ'],
  ㄺ: ['ㄹ', 'ㅋ'],
  ㄷ: ['', 'ㅌ'],
  ㅅ: ['', 'ㅌ'],
  ㅆ: ['', 'ㅌ'],
  ㅈ: ['', 'ㅊ'],
  ㅊ: ['', 'ㅌ'],
  ㅌ: ['', 'ㅌ'],
  ㄵ: ['ㄴ', 'ㅊ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㅂ: ['', 'ㅍ'],
  ㅍ: ['', 'ㅍ'],
  ㅄ: ['', 'ㅍ'],
  ㄼ: ['ㄹ', 'ㅍ'],
  ㄿ: ['ㄹ', 'ㅍ'],
};

function copy(token: SyllableToken): SyllableToken {
  return { ...token };
}

/** Apply aspiration and ㅎ-bearing final handling to one adjacent pair. */
export function applyAspiration(
  left: SyllableToken,
  right: SyllableToken,
): SyllablePair {
  const previous = copy(left);
  const next = copy(right);
  const remainder = H_COMPOUND_REMAINDER[previous.final];

  if (previous.final === 'ㅎ' || remainder !== undefined) {
    const aspirated = ASPIRATED_ONSET[next.initial];
    if (aspirated !== undefined) {
      previous.final = remainder ?? '';
      next.initial = aspirated;
      next.inducedAspiration = true;
      return [previous, next];
    }

    if (next.initial === 'ㅇ') {
      previous.final = remainder ?? '';
      return [previous, next];
    }

    if (remainder !== undefined) {
      previous.final = remainder;
      return [previous, next];
    }
  }

  if (next.initial !== 'ㅎ') return [previous, next];
  const replacement = BEFORE_H[previous.final];
  if (replacement === undefined) return [previous, next];

  previous.final = replacement[0];
  next.initial =
    next.medial === 'ㅣ' &&
    ['ㄷ', 'ㅅ', 'ㅆ', 'ㅊ', 'ㅌ', 'ㄾ'].includes(left.final)
      ? 'ㅊ'
      : replacement[1];
  next.inducedAspiration = true;
  return [previous, next];
}
