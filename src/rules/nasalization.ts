import type { SyllablePair, SyllableToken } from '../types';

const NASAL_FINAL: Readonly<Record<string, string>> = {
  ㄱ: 'ㅇ',
  ㄲ: 'ㅇ',
  ㄳ: 'ㅇ',
  ㄺ: 'ㅇ',
  ㅋ: 'ㅇ',
  ㄷ: 'ㄴ',
  ㅅ: 'ㄴ',
  ㅆ: 'ㄴ',
  ㅈ: 'ㄴ',
  ㅊ: 'ㄴ',
  ㅌ: 'ㄴ',
  ㅎ: 'ㄴ',
  ㅂ: 'ㅁ',
  ㅄ: 'ㅁ',
  ㄿ: 'ㅁ',
  ㅍ: 'ㅁ',
};

/** Apply coda nasalization and the obstruent/sonorant + ㄹ pronunciation. */
export function applyNasalization(
  left: SyllableToken,
  right: SyllableToken,
): SyllablePair {
  const previous = { ...left };
  const next = { ...right };

  if (next.initial === 'ㄴ' || next.initial === 'ㅁ') {
    previous.final = NASAL_FINAL[previous.final] ?? previous.final;
    return [previous, next];
  }

  if (
    next.initial !== 'ㄹ' ||
    previous.final === '' ||
    previous.final === 'ㄹ'
  ) {
    return [previous, next];
  }

  if (previous.final !== 'ㄴ') {
    previous.final = NASAL_FINAL[previous.final] ?? previous.final;
    next.initial = 'ㄴ';
  }

  return [previous, next];
}
