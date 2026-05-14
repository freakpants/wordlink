// words.js – daily word pair list for WordLink

const WORD_PAIRS = [
  ['ocean', 'mountain'],
  ['fire', 'ice'],
  ['music', 'silence'],
  ['city', 'forest'],
  ['summer', 'winter'],
  ['sun', 'moon'],
  ['science', 'art'],
  ['war', 'peace'],
  ['dream', 'reality'],
  ['ancient', 'modern'],
  ['rain', 'desert'],
  ['bird', 'fish'],
  ['king', 'servant'],
  ['glacier', 'volcano'],
  ['love', 'hate'],
  ['light', 'shadow'],
  ['coffee', 'sleep'],
  ['piano', 'drum'],
  ['hammer', 'feather'],
  ['library', 'stadium'],
  ['cloud', 'cave'],
  ['whisper', 'shout'],
  ['rose', 'thorn'],
  ['river', 'highway'],
  ['storm', 'calm'],
  ['child', 'elder'],
  ['north', 'south'],
  ['tiger', 'rabbit'],
  ['gold', 'stone'],
  ['star', 'earth'],
  ['ship', 'train'],
  ['glass', 'rock'],
  ['feast', 'famine'],
  ['medicine', 'poison'],
  ['wolf', 'sheep'],
  ['tower', 'valley'],
  ['snow', 'sand'],
  ['clock', 'nature'],
  ['robot', 'animal'],
  ['poetry', 'math'],
  ['jungle', 'city'],
  ['volcano', 'ocean'],
  ['spider', 'butterfly'],
  ['night', 'noon'],
  ['laugh', 'cry'],
  ['harvest', 'plant'],
  ['hospital', 'battlefield'],
  ['cathedral', 'market'],
  ['wing', 'root'],
  ['dance', 'stone'],
  ['mirror', 'window'],
  ['echo', 'origin'],
  ['flood', 'drought'],
  ['memory', 'future'],
  ['candle', 'torch'],
  ['compass', 'map'],
  ['bridge', 'wall'],
  ['sword', 'shield'],
  ['teacher', 'student'],
  ['bread', 'wine'],
  ['island', 'metropolis'],
  ['compass', 'carousel'],
  ['telescope', 'canyon'],
  ['lantern', 'satellite'],
  ['thunder', 'harbor'],
  ['garden', 'factory'],
  ['fossil', 'neon'],
  ['meteor', 'orchard'],
  ['quill', 'microchip'],
  ['meadow', 'citadel'],
  ['avalanche', 'lantern'],
  ['coral', 'observatory'],
];

/**
 * Returns today's [startWord, endWord] pair, deterministically seeded by date.
 */
function getDailyPair() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const idx = dayOfYear % WORD_PAIRS.length;
  return WORD_PAIRS[idx];
}

/**
 * Returns the day number since a fixed epoch (2025-01-01) for puzzle numbering.
 */
function getPuzzleNumber() {
  const epoch = new Date('2025-01-01');
  const now = new Date();
  return Math.max(1, Math.floor((now - epoch) / 86400000) + 1);
}
