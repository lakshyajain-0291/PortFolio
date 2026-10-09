/**
 * Template 1 language palette — the categorical identity used by the 3D repo
 * scene and its DOM legend. Colour follows the language, never its rank.
 * Validated against the dark surface (#0a0c0d): all slots inside the OKLCH
 * lightness band, >=3:1 contrast, adjacent CVD ΔE >= 7.7 — legend always
 * carries direct text labels as the secondary channel.
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  Go: '#2ca470',
  C: '#c77434',
  Dart: '#0099cb',
  'C++': '#9f8d0e',
  TypeScript: '#8c7dd5',
  JavaScript: '#cf686b',
};

/** Anything outside the six named slots folds into a neutral "Other". */
export const OTHER_COLOR = '#6f7a78';

export const languageColor = (language: string): string => LANGUAGE_COLORS[language] ?? OTHER_COLOR;
