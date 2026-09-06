import type { SyllablePair, SyllableToken, TensificationMode } from '../types';
import { applyAspiration } from './aspiration';
import { applyLiaison } from './liaison';
import { applyLiquidization } from './liquidization';
import { applyNasalization } from './nasalization';
import { applyPalatalization } from './palatalization';
import { applyTensification } from './tensification';

type PairRule = (left: SyllableToken, right: SyllableToken) => SyllablePair;

/** Walk one rule across a cloned contiguous syllable run. */
export function walkPairs(
  tokens: readonly SyllableToken[],
  rule: PairRule,
): SyllableToken[] {
  const result = tokens.map((token) => ({ ...token }));
  for (let index = 0; index < result.length - 1; index += 1) {
    // Bounds follow directly from the loop condition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const left = result[index]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const right = result[index + 1]!;
    const [changedLeft, changedRight] = rule(left, right);
    result[index] = changedLeft;
    result[index + 1] = changedRight;
  }
  return result;
}

/** Run phonological transformations in fixed pronunciation order. */
export function transformSyllableRun(
  tokens: readonly SyllableToken[],
  tensification: TensificationMode,
): SyllableToken[] {
  let result = tokens.map((token) => ({ ...token }));
  for (const rule of [
    applyAspiration,
    applyPalatalization,
    applyLiaison,
    applyNasalization,
    applyLiquidization,
  ]) {
    result = walkPairs(result, rule);
  }
  result = walkPairs(result, (left, right) =>
    applyTensification(left, right, tensification),
  );
  return result;
}
