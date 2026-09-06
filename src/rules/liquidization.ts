import type { SyllablePair, SyllableToken } from '../types';

/** Turn adjacent ㄴ/ㄹ or ㄹ/ㄴ sounds into ㄹㄹ. */
export function applyLiquidization(
  left: SyllableToken,
  right: SyllableToken,
): SyllablePair {
  const previous = { ...left };
  const next = { ...right };

  if (
    (previous.final === 'ㄴ' && next.initial === 'ㄹ') ||
    (previous.final === 'ㄹ' && next.initial === 'ㄴ')
  ) {
    previous.final = 'ㄹ';
    next.initial = 'ㄹ';
  }

  return [previous, next];
}
