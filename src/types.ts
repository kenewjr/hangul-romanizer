/** Supported Korean romanization systems. */
export type RomanizationSystem = 'RR' | 'MR';

/** Optional consonant-tensing behavior. */
export type TensificationMode = 'official' | 'phonetic';

/** Casing applied only to generated romanization. */
export type RomanizationCase = 'lower' | 'sentence' | 'title';

/** Options shared by all romanization helpers. */
export interface RomanizeOptions {
  /** Romanization system. Defaults to `RR`. */
  system?: RomanizationSystem;
  /** Apply pronunciation-oriented tensing. Defaults to `phonetic`. */
  tensification?: TensificationMode;
  /** Insert RR hyphens at ambiguous syllable boundaries. Defaults to `false`. */
  hyphenateAmbiguous?: boolean;
  /** Preserve CRLF, LF, and CR line breaks. Defaults to `true`. */
  preserveLineBreaks?: boolean;
  /** Case generated text. Defaults to `lower`. */
  case?: RomanizationCase;
}

/** One original/output pair returned by `romanizeAligned`. */
export interface AlignedRomanization {
  original: string;
  romanized: string;
}

/** Jamo components of one precomposed modern Hangul syllable. */
export interface DecomposedHangul {
  initial: string;
  medial: string;
  final: string;
}

/** Internal mutable pronunciation token. */
export interface SyllableToken extends DecomposedHangul {
  original: string;
  inducedTense: boolean;
  inducedAspiration: boolean;
}

/** Fully resolved internal options. */
export interface ResolvedRomanizeOptions {
  system: RomanizationSystem;
  tensification: TensificationMode;
  hyphenateAmbiguous: boolean;
  preserveLineBreaks: boolean;
  case: RomanizationCase;
}

export type SyllablePair = readonly [SyllableToken, SyllableToken];
