// words.js – word pool for WordLink; daily pair is seeded by date

const WORDS = [
  // Nature phenomena
  'ocean', 'mountain', 'fire', 'ice', 'rain', 'snow', 'wind', 'storm',
  'thunder', 'lightning', 'flood', 'drought', 'frost', 'fog', 'mist',
  'tide', 'aurora', 'earthquake', 'volcano', 'glacier', 'avalanche',
  'blizzard', 'tornado', 'hurricane', 'twilight', 'dawn', 'dusk',
  // Landscapes & geography
  'forest', 'desert', 'river', 'valley', 'meadow', 'cliff', 'cave',
  'canyon', 'jungle', 'swamp', 'dune', 'lagoon', 'reef', 'tundra',
  'delta', 'geyser', 'coral', 'island', 'harbor', 'coast',
  // Sky & space
  'sun', 'moon', 'star', 'earth', 'cloud', 'meteor', 'satellite',
  'horizon', 'zenith', 'abyss', 'void',
  // Animals
  'wolf', 'eagle', 'dolphin', 'tiger', 'rabbit', 'butterfly', 'shark',
  'hawk', 'fox', 'bear', 'horse', 'deer', 'snake', 'spider', 'crow',
  'whale', 'lion', 'elephant', 'penguin', 'octopus', 'jaguar', 'falcon',
  'owl', 'salmon', 'firefly', 'scorpion', 'bat', 'raven', 'bee', 'moth',
  'sheep', 'bird', 'fish', 'animal',
  // Plants
  'rose', 'oak', 'bamboo', 'cactus', 'vine', 'mushroom', 'fern', 'lotus',
  'pine', 'willow', 'thorn', 'moss', 'ivy', 'orchid', 'cedar', 'seed',
  'root', 'wing', 'blossom', 'orchard',
  // Objects & tools
  'compass', 'mirror', 'bridge', 'lantern', 'sword', 'clock', 'key',
  'anchor', 'telescope', 'microscope', 'hammer', 'feather', 'candle',
  'torch', 'wheel', 'chain', 'rope', 'arrow', 'shield', 'drum', 'piano',
  'quill', 'map', 'cage', 'crown', 'coin', 'bell', 'gate', 'ladder',
  'lens', 'prism', 'hourglass', 'beacon', 'window', 'wall', 'door',
  'ship', 'train',
  // Buildings & places
  'castle', 'market', 'library', 'cathedral', 'temple', 'tower', 'maze',
  'museum', 'dungeon', 'lighthouse', 'observatory', 'citadel', 'arena',
  'monastery', 'garden', 'factory', 'hospital', 'battlefield', 'stadium',
  'city', 'village', 'metropolis',
  // Abstract concepts
  'dream', 'memory', 'silence', 'shadow', 'justice', 'chaos', 'wisdom',
  'courage', 'fear', 'hope', 'faith', 'doubt', 'beauty', 'truth', 'power',
  'harmony', 'mystery', 'legend', 'myth', 'fate', 'chance', 'echo',
  'vision', 'hunger', 'grief', 'joy', 'rage', 'shame', 'pride', 'exile',
  'war', 'peace', 'love', 'hate', 'light', 'darkness', 'freedom', 'origin',
  'future', 'ghost', 'omen', 'curse', 'miracle',
  // Time & states
  'summer', 'winter', 'night', 'noon', 'north', 'south', 'east', 'west',
  'ancient', 'modern', 'calm',
  // Food, materials & substances
  'bread', 'wine', 'salt', 'honey', 'spice', 'poison', 'medicine', 'feast',
  'famine', 'coffee', 'gold', 'silver', 'glass', 'stone', 'rock', 'iron',
  'crystal', 'amber', 'fossil', 'neon', 'sand', 'ash',
  // People & roles
  'king', 'servant', 'child', 'elder', 'teacher', 'student', 'warrior',
  'monk', 'shepherd', 'merchant', 'poet', 'spy', 'hunter',
  // Arts, science & knowledge
  'music', 'art', 'science', 'math', 'poetry', 'robot',
  // Actions as nouns
  'dance', 'whisper', 'shout', 'laugh', 'cry', 'harvest', 'flight',
  'birth', 'death', 'sleep',
];

// ─────────────────────────────────────────────────────────
// Seeded PRNG (splitmix32)
// ─────────────────────────────────────────────────────────
function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x9e3779b9) >>> 0;
    let t = Math.imul(s ^ (s >>> 16), 0x21f0aaad) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97) >>> 0;
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

/**
 * Returns today's [startWord, endWord] pair, deterministically seeded by date.
 * All players on the same calendar day receive the same pair.
 */
function getDailyPair() {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const rng = seededRng(seed);
  return getRandomPair(rng);
}

function getRandomPair(rng = Math.random) {
  const idx1 = Math.floor(rng() * WORDS.length);
  let idx2;
  do { idx2 = Math.floor(rng() * WORDS.length); } while (idx2 === idx1);
  return [WORDS[idx1], WORDS[idx2]];
}

/**
 * Returns the day number since a fixed epoch (2025-01-01) for puzzle numbering.
 */
function getPuzzleNumber() {
  const epoch = new Date('2025-01-01');
  const now = new Date();
  return Math.max(1, Math.floor((now - epoch) / 86400000) + 1);
}
