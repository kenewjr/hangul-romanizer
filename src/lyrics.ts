import { toSyllableToken } from './decompose';
import {
  MR_COMPATIBILITY,
  MR_FINALS,
  MR_INITIALS_VOICED,
  MR_INITIALS_WORD_START,
  MR_MEDIALS,
} from './tables/mr';
import {
  RR_COMPATIBILITY,
  RR_FINALS,
  RR_INITIALS,
  RR_MEDIALS,
} from './tables/rr';
import { transformSyllableRun } from './rules';
import type {
  AlignedRomanization,
  ResolvedRomanizeOptions,
  RomanizationCase,
  RomanizationSystem,
  RomanizeOptions,
  SyllableToken,
  TensificationMode,
} from './types';

interface SyllableUnit {
  kind: 'syllable';
  original: string;
  token: SyllableToken;
  romanized: string;
}

interface JamoUnit {
  kind: 'jamo';
  original: string;
  romanized: string;
}

interface TextUnit {
  kind: 'text';
  original: string;
  romanized: string;
}

type Unit = SyllableUnit | JamoUnit | TextUnit;

const DEFAULT_OPTIONS: ResolvedRomanizeOptions = {
  system: 'RR',
  tensification: 'phonetic',
  hyphenateAmbiguous: false,
  preserveLineBreaks: true,
  case: 'lower',
};

function enumOption<T extends string>(
  value: unknown,
  fallback: T,
  allowed: readonly T[],
  name: string,
): T {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new RangeError(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return value as T;
}

function booleanOption(
  value: unknown,
  fallback: boolean,
  name: string,
): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    throw new TypeError(`${name} must be a boolean`);
  }
  return value;
}

/** Validate and fill public options without mutating the caller's object. */
export function resolveOptions(
  options?: RomanizeOptions,
): ResolvedRomanizeOptions {
  const runtimeOptions = options as unknown;
  if (
    runtimeOptions !== undefined &&
    (typeof runtimeOptions !== 'object' ||
      runtimeOptions === null ||
      Array.isArray(runtimeOptions))
  ) {
    throw new TypeError('options must be an object');
  }

  const source = (runtimeOptions ?? {}) as Record<string, unknown>;
  return {
    system: enumOption<RomanizationSystem>(
      source.system,
      DEFAULT_OPTIONS.system,
      ['RR', 'MR'],
      'system',
    ),
    tensification: enumOption<TensificationMode>(
      source.tensification,
      DEFAULT_OPTIONS.tensification,
      ['official', 'phonetic'],
      'tensification',
    ),
    hyphenateAmbiguous: booleanOption(
      source.hyphenateAmbiguous,
      DEFAULT_OPTIONS.hyphenateAmbiguous,
      'hyphenateAmbiguous',
    ),
    preserveLineBreaks: booleanOption(
      source.preserveLineBreaks,
      DEFAULT_OPTIONS.preserveLineBreaks,
      'preserveLineBreaks',
    ),
    case: enumOption<RomanizationCase>(
      source.case,
      DEFAULT_OPTIONS.case,
      ['lower', 'sentence', 'title'],
      'case',
    ),
  };
}

function tokenize(text: string, options: ResolvedRomanizeOptions): Unit[] {
  const characters = Array.from(text);
  const units: Unit[] = [];
  const compatibility =
    options.system === 'RR' ? RR_COMPATIBILITY : MR_COMPATIBILITY;

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character === undefined) continue;

    if (character === '\r' && characters[index + 1] === '\n') {
      units.push({
        kind: 'text',
        original: '\r\n',
        romanized: options.preserveLineBreaks ? '\r\n' : ' ',
      });
      index += 1;
      continue;
    }

    if (character === '\r' || character === '\n') {
      units.push({
        kind: 'text',
        original: character,
        romanized: options.preserveLineBreaks ? character : ' ',
      });
      continue;
    }

    const token = toSyllableToken(character);
    if (token !== null) {
      units.push({
        kind: 'syllable',
        original: character,
        token,
        romanized: '',
      });
      continue;
    }

    const mapped = compatibility[character];
    if (mapped !== undefined) {
      units.push({ kind: 'jamo', original: character, romanized: mapped });
    } else {
      units.push({ kind: 'text', original: character, romanized: character });
    }
  }

  return units;
}

function finalValue(token: SyllableToken, system: RomanizationSystem): string {
  const table = system === 'RR' ? RR_FINALS : MR_FINALS;
  return table[token.final] ?? '';
}

function isMrVoicingEnvironment(final: string): boolean {
  return [
    '',
    'ㄴ',
    'ㄵ',
    'ㄶ',
    'ㄹ',
    'ㄻ',
    'ㄼ',
    'ㄽ',
    'ㄾ',
    'ㅀ',
    'ㅁ',
    'ㅇ',
  ].includes(final);
}

function mrInitial(
  token: SyllableToken,
  index: number,
  run: readonly SyllableToken[],
): string {
  const previous = run[index - 1];
  const voiced =
    previous !== undefined && isMrVoicingEnvironment(previous.final);
  const table = voiced ? MR_INITIALS_VOICED : MR_INITIALS_WORD_START;
  if (token.initial === 'ㅅ' && token.medial === 'ㅟ') return 'sh';
  return table[token.initial] ?? '';
}

function medialValue(
  token: SyllableToken,
  index: number,
  run: readonly SyllableToken[],
  system: RomanizationSystem,
): string {
  if (system === 'RR') return RR_MEDIALS[token.medial] ?? '';
  const previous = run[index - 1];
  if (
    token.initial === 'ㅇ' &&
    token.medial === 'ㅔ' &&
    previous !== undefined &&
    previous.final === '' &&
    (previous.medial === 'ㅏ' || previous.medial === 'ㅗ')
  ) {
    return 'ë';
  }
  return MR_MEDIALS[token.medial] ?? '';
}

function rrAmbiguityPrefix(
  previous: SyllableToken | undefined,
  current: SyllableToken,
  options: ResolvedRomanizeOptions,
): string {
  if (
    options.system !== 'RR' ||
    !options.hyphenateAmbiguous ||
    previous === undefined
  ) {
    return '';
  }

  if (previous.final === '' && current.initial === 'ㅇ') return '-';
  if (previous.final === 'ㄴ' && current.initial === 'ㄱ') return '-';
  return '';
}

function mrBoundaryPrefix(
  previous: SyllableToken | undefined,
  currentInitial: string,
  system: RomanizationSystem,
): string {
  if (system !== 'MR' || previous === undefined) return '';
  return finalValue(previous, system) === 'n' && currentInitial === 'g'
    ? "'"
    : '';
}

function collapseInducedTense(
  initial: string,
  token: SyllableToken,
  previous: SyllableToken | undefined,
  system: RomanizationSystem,
): string {
  if (!token.inducedTense || previous === undefined) return initial;
  const previousFinal = finalValue(previous, system);
  return previousFinal !== '' && initial.startsWith(previousFinal)
    ? initial.slice(previousFinal.length)
    : initial;
}

function renderRun(
  run: readonly SyllableToken[],
  options: ResolvedRomanizeOptions,
): string[] {
  return run.map((token, index) => {
    const previous = run[index - 1];
    let initial =
      options.system === 'RR'
        ? token.initial === 'ㄹ' && previous?.final === 'ㄹ'
          ? 'l'
          : (RR_INITIALS[token.initial] ?? '')
        : mrInitial(token, index, run);
    initial = collapseInducedTense(initial, token, previous, options.system);
    const prefix =
      rrAmbiguityPrefix(previous, token, options) +
      mrBoundaryPrefix(previous, initial, options.system);
    return (
      prefix +
      initial +
      medialValue(token, index, run, options.system) +
      finalValue(token, options.system)
    );
  });
}

function transformRuns(units: Unit[], options: ResolvedRomanizeOptions): void {
  for (let start = 0; start < units.length; ) {
    if (units[start]?.kind !== 'syllable') {
      start += 1;
      continue;
    }

    let end = start;
    const tokens: SyllableToken[] = [];
    while (end < units.length && units[end]?.kind === 'syllable') {
      const unit = units[end];
      if (unit?.kind === 'syllable') tokens.push(unit.token);
      end += 1;
    }

    const transformed = transformSyllableRun(tokens, options.tensification);
    const rendered = renderRun(transformed, options);
    for (let offset = 0; offset < transformed.length; offset += 1) {
      const unit = units[start + offset];
      const token = transformed[offset];
      const romanized = rendered[offset];
      if (
        unit?.kind === 'syllable' &&
        token !== undefined &&
        romanized !== undefined
      ) {
        unit.token = token;
        unit.romanized = romanized;
      }
    }
    start = end;
  }
}

function uppercaseFirstLetter(value: string): string {
  const characters = Array.from(value);
  const index = characters.findIndex(
    (character) => character.toLowerCase() !== character.toUpperCase(),
  );
  if (index === -1) return value;
  const character = characters[index];
  if (character === undefined) return value;
  characters[index] = character.toUpperCase();
  return characters.join('');
}

function applyCase(units: Unit[], mode: RomanizationCase): void {
  if (mode === 'lower') return;
  let sentenceStarted = false;
  let wordStarted = false;

  for (const unit of units) {
    if (unit.kind === 'text') {
      if (unit.original.includes('\n') || unit.original.includes('\r')) {
        sentenceStarted = false;
      }
      wordStarted = false;
      continue;
    }

    if (mode === 'sentence' && !sentenceStarted) {
      unit.romanized = uppercaseFirstLetter(unit.romanized);
      sentenceStarted = true;
    } else if (mode === 'title' && !wordStarted) {
      unit.romanized = uppercaseFirstLetter(unit.romanized);
    }
    wordStarted = true;
  }
}

function align(units: readonly Unit[]): AlignedRomanization[] {
  const result: AlignedRomanization[] = [];
  let previousKind: Unit['kind'] | undefined;
  for (const unit of units) {
    const previous = result[result.length - 1];
    if (
      unit.kind === 'text' &&
      previousKind === 'text' &&
      previous !== undefined
    ) {
      previous.original += unit.original;
      previous.romanized += unit.romanized;
    } else {
      result.push({ original: unit.original, romanized: unit.romanized });
    }
    previousKind = unit.kind;
  }
  return result;
}

function renderAligned(
  text: string,
  options: ResolvedRomanizeOptions,
): AlignedRomanization[] {
  const units = tokenize(text, options);
  transformRuns(units, options);
  applyCase(units, options.case);
  return align(units);
}

function assertText(text: unknown): asserts text is string {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
}

/** Romanize Hangul in a string while preserving all other content. */
export function romanize(text: string, options?: RomanizeOptions): string {
  assertText(text);
  const resolved = resolveOptions(options);
  return renderAligned(text, resolved)
    .map(({ romanized }) => romanized)
    .join('');
}

/** Romanize each supplied lyric line independently and retain array shape. */
export function romanizeLines(
  lines: string[],
  options?: RomanizeOptions,
): string[] {
  if (!Array.isArray(lines)) throw new TypeError('lines must be an array');
  for (const line of lines) assertText(line);
  const resolved = resolveOptions(options);
  return lines.map((line) =>
    renderAligned(line, resolved)
      .map(({ romanized }) => romanized)
      .join(''),
  );
}

/** Romanize exactly one Unicode code point without neighboring context. */
export function romanizeSyllable(
  char: string,
  options?: RomanizeOptions,
): string {
  assertText(char);
  if (Array.from(char).length !== 1) {
    throw new RangeError('char must contain exactly one Unicode code point');
  }
  const resolved = resolveOptions(options);
  return renderAligned(char, resolved)
    .map(({ romanized }) => romanized)
    .join('');
}

/**
 * Romanize text into per-syllable pairs. Mapped compatibility jamo receive
 * individual pairs; adjacent passthrough content remains grouped.
 */
export function romanizeAligned(
  text: string,
  options?: RomanizeOptions,
): AlignedRomanization[] {
  assertText(text);
  return renderAligned(text, resolveOptions(options));
}
