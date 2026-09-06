import type { SyllablePair, SyllableToken, TensificationMode } from '../types';

const OBSTRUENT_FINALS = new Set([
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄺ',
  'ㅋ',
  'ㄷ',
  'ㅅ',
  'ㅆ',
  'ㅈ',
  'ㅊ',
  'ㅌ',
  'ㅎ',
  'ㅂ',
  'ㅄ',
  'ㄿ',
  'ㅍ',
]);

const TENSE_ONSET: Readonly<Record<string, string>> = {
  ㄱ: 'ㄲ',
  ㄷ: 'ㄸ',
  ㅂ: 'ㅃ',
  ㅅ: 'ㅆ',
  ㅈ: 'ㅉ',
};

/** Apply optional pronunciation-oriented tensing after an obstruent coda. */
export function applyTensification(
  left: SyllableToken,
  right: SyllableToken,
  mode: TensificationMode,
): SyllablePair {
  const previous = { ...left };
  const next = { ...right };
  if (mode === 'official' || !OBSTRUENT_FINALS.has(previous.final)) {
    return [previous, next];
  }

  const tense = TENSE_ONSET[next.initial];
  if (tense !== undefined) {
    next.initial = tense;
    next.inducedTense = true;
  }

  return [previous, next];
}
