import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyAspiration } from '../../src/rules/aspiration';

function apply(word: string) {
  const values = Array.from(word).map((char) => toSyllableToken(char)!);
  return applyAspiration(values[0]!, values[1]!);
}

it('aspirates following plain obstruents after ㅎ', () => {
  expect(apply('좋고')).toMatchObject([{ final: '' }, { initial: 'ㅋ' }]);
  expect(apply('놓다')).toMatchObject([{ final: '' }, { initial: 'ㅌ' }]);
});

it('aspirates an initial ㅎ from a preceding coda', () => {
  expect(apply('잡혀')).toMatchObject([{ final: '' }, { initial: 'ㅍ' }]);
  expect(apply('굳히')).toMatchObject([{ final: '' }, { initial: 'ㅊ' }]);
});

it('retains first member of ㅎ compounds and handles ㅎ loss', () => {
  expect(apply('많고')).toMatchObject([{ final: 'ㄴ' }, { initial: 'ㅋ' }]);
  expect(apply('끓다')).toMatchObject([{ final: 'ㄹ' }, { initial: 'ㅌ' }]);
  expect(apply('좋아')).toMatchObject([{ final: '' }, { initial: 'ㅇ' }]);
  expect(apply('많소')).toMatchObject([{ final: 'ㄴ' }, { initial: 'ㅅ' }]);
});
