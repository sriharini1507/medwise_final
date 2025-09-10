// src/utils/text.js

// Normalize strings for case-/accent-insensitive matching and dedupe.
export const norm = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "") // strip accents/punctuation
    .trim();

export const uniq = (arr) => Array.from(new Set(arr));
