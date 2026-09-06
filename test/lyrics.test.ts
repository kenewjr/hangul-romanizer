import { describe, expect, it } from 'vitest';
import {
  romanize,
  romanizeAligned,
  romanizeLines,
  romanizeSyllable,
} from '../src';

describe('public lyrics API', () => {
  it('uses lyric-oriented RR defaults and every requested rule', () => {
    expect(romanize('안녕하세요')).toBe('annyeonghaseyo');
    expect(romanize('한국어')).toBe('hangugeo');
    expect(romanize('학년')).toBe('hangnyeon');
    expect(romanize('신라')).toBe('silla');
    expect(romanize('굳이')).toBe('guji');
    expect(romanize('같이')).toBe('gachi');
    expect(romanize('좋고')).toBe('joko');
    expect(romanize('독립')).toBe('dongnip');
  });

  it('supports documented tensing modes', () => {
    expect(romanize('학교')).toBe('hakkyo');
    expect(romanize('학교', { tensification: 'official' })).toBe('hakgyo');
  });

  it('supports MR vowels, aspiration, voicing, and n-g ambiguity', () => {
    expect(romanize('한국어', { system: 'MR' })).toBe("han'gugŏ");
    expect(romanize('투표', { system: 'MR' })).toBe("t'up'yo");
    expect(romanize('가구', { system: 'MR', tensification: 'official' })).toBe(
      'kagu',
    );
  });

  it('preserves mixed scripts, punctuation, ad-libs, emoji, and Hanja', () => {
    expect(romanize('Hello, 사랑해! (오오) 2026 國語 😀')).toBe(
      'Hello, saranghae! (oo) 2026 國語 😀',
    );
  });

  it('maps compatibility jamo and leaves archaic compatibility jamo intact', () => {
    expect(romanize('ㅋㅋㅋ ㅠㅠ ㆎ')).toBe('kkk yuyu ㆎ');
  });

  it('preserves or flattens exact line-break sequences', () => {
    const text = '하나\r\n\r\n둘\n셋\r넷';
    expect(romanize(text)).toBe('hana\r\n\r\ndul\nset\rnet');
    expect(romanize(text, { preserveLineBreaks: false })).toBe(
      'hana  dul set net',
    );
    expect(romanizeLines(['하나', '', '둘'])).toEqual(['hana', '', 'dul']);
  });

  it('applies casing only to generated segments', () => {
    expect(romanize('hello 안녕\n사랑', { case: 'sentence' })).toBe(
      'hello Annyeong\nSarang',
    );
    expect(romanize('안녕 my 사랑', { case: 'title' })).toBe(
      'Annyeong my Sarang',
    );
  });

  it('optionally hyphenates RR ambiguity', () => {
    expect(romanize('해운대', { hyphenateAmbiguous: true })).toBe('hae-undae');
    expect(romanize('반구대', { hyphenateAmbiguous: true })).toBe('ban-gudae');
    expect(romanize('해운대')).toBe('haeundae');
  });

  it('returns reconstructable karaoke alignment', () => {
    const input = '한국어 + K-pop!';
    const aligned = romanizeAligned(input);
    expect(aligned.slice(0, 3)).toEqual([
      { original: '한', romanized: 'han' },
      { original: '국', romanized: 'gu' },
      { original: '어', romanized: 'geo' },
    ]);
    expect(aligned.map(({ original }) => original).join('')).toBe(input);
    expect(aligned.map(({ romanized }) => romanized).join('')).toBe(
      romanize(input),
    );

    const grouped = romanizeAligned('abc한!!?글xyz');
    expect(grouped).toEqual([
      { original: 'abc', romanized: 'abc' },
      { original: '한', romanized: 'han' },
      { original: '!!?', romanized: '!!?' },
      { original: '글', romanized: 'geul' },
      { original: 'xyz', romanized: 'xyz' },
    ]);
  });

  it('romanizes one code point independently', () => {
    expect(romanizeSyllable('한')).toBe('han');
    expect(romanizeSyllable('ㅋ')).toBe('k');
    expect(romanizeSyllable('😀')).toBe('😀');
    expect(() => romanizeSyllable('한글')).toThrow(RangeError);
  });

  it('is deterministic', () => {
    const input = '같이 가자 (yeah)\n한국어!';
    const options = { system: 'RR' as const, case: 'sentence' as const };
    expect(romanize(input, options)).toBe(romanize(input, options));
  });

  it('validates all public inputs and options', () => {
    expect(() => romanize(1 as never)).toThrow(TypeError);
    expect(() => romanize('한', null as never)).toThrow(TypeError);
    expect(() => romanize('한', { system: 'xx' as never })).toThrow(RangeError);
    expect(() => romanize('한', { case: 'upper' as never })).toThrow(
      RangeError,
    );
    expect(() => romanize('한', { hyphenateAmbiguous: 1 as never })).toThrow(
      TypeError,
    );
    expect(() => romanizeLines('한' as never)).toThrow(TypeError);
    expect(() => romanizeLines(['한', 1 as never])).toThrow(TypeError);
  });
});
