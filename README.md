# hangul-romanizer

Lyrics-first Korean romanization for Node.js and browsers.

`hangul-romanizer` converts modern Hangul into readable Latin-script lyric lines. It supports Revised Romanization (RR), McCune–Reischauer (MR), pronunciation rules across adjacent syllables, isolated compatibility jamo, multiline lyrics, and per-syllable karaoke alignment.

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088ff?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
![version](https://img.shields.io/badge/version-0.1.0-5c6ac4)
[![license](https://img.shields.io/badge/license-MIT-2ea44f)](./LICENSE)

## Why lyrics?

Generic transliteration often maps each written syllable independently. Sung Korean needs more context. This package transforms decomposed jamo before Latin substitution, so common pronunciation changes become readable:

| Rule                      | Hangul | Output      |
| ------------------------- | ------ | ----------- |
| Liaison                   | 한국어 | `hangugeo`  |
| Nasalization              | 학년   | `hangnyeon` |
| Liquidization             | 신라   | `silla`     |
| Palatalization            | 굳이   | `guji`      |
| Aspiration                | 좋고   | `joko`      |
| Optional phonetic tensing | 학교   | `hakkyo`    |

## Install

```bash
npm install hangul-romanizer
```

Requires Node.js 18 or newer. Package has zero runtime dependencies.

## Quick start

### ESM / TypeScript

```ts
import { romanize } from 'hangul-romanizer';

romanize('안녕하세요');
// => 'annyeonghaseyo'

romanize('Hello, 사랑해! (오오)');
// => 'Hello, saranghae! (oo)'
```

### CommonJS

```js
const { romanize } = require('hangul-romanizer');

romanize('한국어');
// => 'hangugeo'
```

## API

### `romanize(text, options?)`

Returns one romanized string. Non-Hangul text passes through unchanged.

```ts
romanize('같이 가자\n사랑해');
// => 'gachi gaja\nsaranghae'
```

### `romanizeLines(lines, options?)`

Romanizes each array element independently. Useful when lyric lines already have timing or IDs.

```ts
romanizeLines(['첫 줄', '', '둘째 줄']);
// => ['cheot jul', '', 'duljjae jul']
```

### `romanizeSyllable(char, options?)`

Romanizes exactly one Unicode code point without neighboring context. Accepts a precomposed syllable, compatibility jamo, or passthrough character.

```ts
romanizeSyllable('한'); // 'han'
romanizeSyllable('ㅋ'); // 'k'
```

### `romanizeAligned(text, options?)`

Returns reconstructable original/output pairs for karaoke highlighting.

```ts
romanizeAligned('한국어!');
// [
//   { original: '한', romanized: 'han' },
//   { original: '국', romanized: 'gu' },
//   { original: '어', romanized: 'geo' },
//   { original: '!', romanized: '!' }
// ]
```

Concatenating every `original` value recreates input exactly. Concatenating every `romanized` value equals `romanize(text, options)`.

### `decomposeHangul(char)`

Decomposes one modern precomposed Hangul syllable into compatibility jamo. Returns `null` for other values.

```ts
decomposeHangul('한');
// => { initial: 'ㅎ', medial: 'ㅏ', final: 'ㄴ' }
```

### `isHangul(char)`

Returns `true` for one modern precomposed Hangul syllable or one character in U+3131–U+318E Hangul Compatibility Jamo.

## Options

```ts
interface RomanizeOptions {
  system?: 'RR' | 'MR';
  tensification?: 'official' | 'phonetic';
  hyphenateAmbiguous?: boolean;
  preserveLineBreaks?: boolean;
  case?: 'lower' | 'sentence' | 'title';
}
```

| Option               | Default      | Meaning                                                                    |
| -------------------- | ------------ | -------------------------------------------------------------------------- |
| `system`             | `'RR'`       | Revised Romanization or McCune–Reischauer                                  |
| `tensification`      | `'phonetic'` | Lyric-friendly tensing (`학교` → `hakkyo`) or official spelling (`hakgyo`) |
| `hyphenateAmbiguous` | `false`      | Add optional RR disambiguation (`해운대` → `hae-undae`)                    |
| `preserveLineBreaks` | `true`       | Preserve CRLF/LF/CR; `false` replaces each break with a space              |
| `case`               | `'lower'`    | Case generated romanization only; passthrough Latin text stays untouched   |

```ts
romanize('학교', { tensification: 'official' });
// => 'hakgyo'

romanize('한국어', { system: 'MR' });
// => "han'gugŏ"

romanize('해운대', { hyphenateAmbiguous: true });
// => 'hae-undae'
```

## Supported text and boundaries

- Modern precomposed Hangul syllables: U+AC00–U+D7A3.
- Compatibility jamo: mapped independently when modern mappings exist; archaic forms pass through unchanged.
- Latin, digits, punctuation, emoji, Hanja, and whitespace: unchanged.
- Phonological rules run only across contiguous precomposed Hangul syllables. Spaces and punctuation form pronunciation boundaries.
- Output is deterministic and performs no I/O.

## Development

```bash
npm install
npm test
npm run test:coverage
npm run typecheck
npm run lint
npm run build
npm run example
npm run pack:check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for fixture and test rules.

## License

MIT © 2026 Hangul Romanizer contributors
