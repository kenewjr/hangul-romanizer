import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyLiquidization } from '../../src/rules/liquidization';

function apply(word: string) {
  const values = Array.from(word).map((char) => toSyllableToken(char)!);
  return applyLiquidization(values[0]!, values[1]!);
}

it('liquidizes in both directions', () => {
  expect(apply('신라')).toMatchObject([{ final: 'ㄹ' }, { initial: 'ㄹ' }]);
  expect(apply('설날')).toMatchObject([{ final: 'ㄹ' }, { initial: 'ㄹ' }]);
});

it('leaves unrelated pairs alone', () => {
  expect(apply('한글')).toMatchObject([{ final: 'ㄴ' }, { initial: 'ㄱ' }]);
});
