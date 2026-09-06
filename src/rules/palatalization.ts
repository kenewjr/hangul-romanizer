import type { SyllablePair, SyllableToken } from '../types';

/** Apply ㄷ/ㅌ palatalization before vowel-initial 이. */
export function applyPalatalization(
  left: SyllableToken,
  right: SyllableToken,
): SyllablePair {
  const previous = { ...left };
  const next = { ...right };

  if (next.initial !== 'ㅇ' || next.medial !== 'ㅣ') {
    return [previous, next];
  }

  if (previous.final === 'ㄷ') {
    previous.final = '';
    next.initial = 'ㅈ';
  } else if (previous.final === 'ㅌ') {
    previous.final = '';
    next.initial = 'ㅊ';
    next.inducedAspiration = true;
  } else if (previous.final === 'ㄾ') {
    previous.final = 'ㄹ';
    next.initial = 'ㅊ';
    next.inducedAspiration = true;
  }

  return [previous, next];
}
