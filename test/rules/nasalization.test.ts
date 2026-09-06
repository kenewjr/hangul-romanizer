import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyNasalization } from '../../src/rules/nasalization';

function pair(word: string) {
  return Array.from(word).map((char) => toSyllableToken(char)!);
}

it('nasalizes velar, coronal, and labial codas', () => {
  expect(applyNasalization(...(pair('학년') as [never, never]))).toMatchObject([
    { final: 'ㅇ' },
    { initial: 'ㄴ' },
  ]);
  expect(applyNasalization(...(pair('있는') as [never, never]))).toMatchObject([
    { final: 'ㄴ' },
    { initial: 'ㄴ' },
  ]);
  expect(applyNasalization(...(pair('십만') as [never, never]))).toMatchObject([
    { final: 'ㅁ' },
    { initial: 'ㅁ' },
  ]);
});

it('turns obstruent plus rieul into nasal plus nieun', () => {
  expect(applyNasalization(...(pair('독립') as [never, never]))).toMatchObject([
    { final: 'ㅇ' },
    { initial: 'ㄴ' },
  ]);
});
