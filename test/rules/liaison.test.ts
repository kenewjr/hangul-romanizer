import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyLiaison } from '../../src/rules/liaison';

function tokens(word: string) {
  return Array.from(word).map((char) => toSyllableToken(char)!);
}

it('moves simple finals before vowel-initial syllables', () => {
  const [left, right] = tokens('국어');
  expect(applyLiaison(left!, right!)).toMatchObject([
    { final: '' },
    { initial: 'ㄱ' },
  ]);
});

it('splits compound finals and skips non-liaison contexts', () => {
  const [left, right] = tokens('앉아');
  expect(applyLiaison(left!, right!)).toMatchObject([
    { final: 'ㄴ' },
    { initial: 'ㅈ' },
  ]);
  const [closed, consonant] = tokens('한국');
  expect(applyLiaison(closed!, consonant!)).toMatchObject([
    { final: 'ㄴ' },
    { initial: 'ㄱ' },
  ]);
});
