import { expect, it } from 'vitest';
import { toSyllableToken } from '../../src/decompose';
import { applyTensification } from '../../src/rules/tensification';

function values(word: string) {
  return Array.from(word).map((char) => toSyllableToken(char)!);
}

it('tenses eligible onsets after obstruent codas in phonetic mode', () => {
  const [left, right] = values('학교');
  expect(applyTensification(left!, right!, 'phonetic')).toMatchObject([
    { final: 'ㄱ' },
    { initial: 'ㄲ', inducedTense: true },
  ]);
});

it('keeps official mode and ineligible pairs unchanged', () => {
  const [left, right] = values('학교');
  expect(applyTensification(left!, right!, 'official')).toMatchObject([
    { final: 'ㄱ' },
    { initial: 'ㄱ' },
  ]);
  const [sonorant, onset] = values('한글');
  expect(applyTensification(sonorant!, onset!, 'phonetic')).toMatchObject([
    { final: 'ㄴ' },
    { initial: 'ㄱ' },
  ]);
});
