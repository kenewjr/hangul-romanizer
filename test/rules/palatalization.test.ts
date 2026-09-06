import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyPalatalization } from '../../src/rules/palatalization';

function apply(word: string) {
  const values = Array.from(word).map((char) => toSyllableToken(char)!);
  return applyPalatalization(values[0]!, values[1]!);
}

it('palatalizes digeut and tieut before 이', () => {
  expect(apply('굳이')).toMatchObject([{ final: '' }, { initial: 'ㅈ' }]);
  expect(apply('같이')).toMatchObject([{ final: '' }, { initial: 'ㅊ' }]);
});

it('retains rieul from ㄾ and skips other vowels', () => {
  expect(apply('훑이')).toMatchObject([{ final: 'ㄹ' }, { initial: 'ㅊ' }]);
  expect(apply('굳어')).toMatchObject([{ final: 'ㄷ' }, { initial: 'ㅇ' }]);
});
