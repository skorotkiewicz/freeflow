/**
 * FreeRead.js
 * Transforms rigid text into a FlowGlyph syntax that naturally guides
 * readers into free, spontaneous vocalization. Language-agnostic. LLM-free.
 */

const FLOW = {
  MICRO: '·',      // Light vocal rest (comma-like but softer)
  FLOW: '~',       // Voice continues without hard stop
  BREATH: '—',     // Natural breath reset
  TRAIL: '…',      // Thought lingers, voice drops
  NARROW: '\u2009', // Thin space: encourages slight vocal rush/connection
  NORMAL: ' ',
};

/**
 * Approximate rhythm load of a word (character count ≈ syllable proxy)
 */
function getRhythmLoad(word) {
  return word.replace(/\p{P}/gu, '').length;
}

/**
 * Group words into cognitive chunks based on rhythmic load.
 * Target: ~12-14 chars per chunk (mimics natural spoken phrasing)
 */
function chunkByRhythm(words, paceMultiplier = 1) {
  const TARGET = Math.round(13 * paceMultiplier);
  const chunks = [];
  let current = [];
  let load = 0;

  for (const w of words) {
    const wLoad = getRhythmLoad(w);
    if (load + wLoad > TARGET && current.length > 1) {
      chunks.push(current);
      current = [w];
      load = wLoad;
    } else {
      current.push(w);
      load += wLoad;
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/**
 * Main transformation function
 */
export function freeRead(text, options = {}) {
  const {
    pace = 'normal', // 'fast' | 'normal' | 'slow'
    breathChar = FLOW.BREATH,
    flowChar = FLOW.FLOW,
    microChar = FLOW.MICRO,
    trailChar = FLOW.TRAIL,
  } = options;

  const paceMap = { fast: 0.8, normal: 1, slow: 1.3 };
  const paceMul = paceMap[pace] ?? 1;

  // 1. Normalize line breaks into breath continuations
  let normalized = text.replace(/[\r\n]+/g, ` ${flowChar} `).trim();

  // 2. Split into thought units (universal sentence boundaries)
  const sentences = normalized.split(/(?<=[.!?。！？；;：:])\s+/);

  return sentences
    .map((sent, idx) => {
      // Extract words (Unicode-safe)
      const words = sent.match(/[\p{L}\p{N}]+/gu) || [];
      if (words.length === 0) return '';

      // 3. Rhythm-based chunking
      const chunks = chunkByRhythm(words, paceMul);

      // 4. Apply FlowGlyph prosody
      return chunks
        .map((chunk, i) => {
          const isLast = i === chunks.length - 1;
          const isLastSentence = idx === sentences.length - 1;

          // Determine prosody marker
          let marker;
          if (isLast && isLastSentence) marker = trailChar;
          else if (isLast) marker = breathChar;
          else if (i % 3 === 0) marker = microChar;
          else marker = flowChar;

          // Vocal lift: capitalize first word of each chunk
          const first = chunk[0];
          const lifted = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
          const rest = chunk.slice(1).join(FLOW.NARROW);
          const phrase = i === 0 ? `${lifted}${rest ? ' ' + rest : ''}` : chunk.join(FLOW.NARROW);

          return `${phrase} ${marker}`;
        })
        .join(FLOW.NORMAL)
        .trim();
    })
    .filter(Boolean)
    .join(` ${breathChar} `);
}

export default freeRead;
