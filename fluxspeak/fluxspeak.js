// fluxspeak.js - A simple Node.js lib for "free-flow reading syntax"
// Turns rigid text (poems, scripts, prompts) into something that feels like
// your own thoughts when read aloud from a prompter.
// International-friendly: works on any language using only punctuation + length heuristics.
// No dictionaries, no hardcoded words, no LLM.

const DEFAULT_OPTIONS = {
  maxChunkWords: 7,      // ideal "breath" size for natural reading
  minChunkWords: 3,
  pauseChance: 0.35,     // chance to insert ... or —
  flowVariance: true,    // slight random variation per run
  preserveCase: false,   // set true to keep original casing
};

class FluxSpeak {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Transform text into free-flow syntax
   * @param {string} text
   * @returns {string}
   */
  transform(text) {
    if (!text || typeof text !== 'string') return '';

    // Step 1: Normalize whitespace but keep meaningful breaks
    let cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s+/g, '$1\n')   // sentences become natural line candidates
      .trim();

    // Step 2: Split into sentences / major units (works across languages)
    const sentences = cleaned.split(/\n+/).filter(s => s.trim().length > 0);

    const chunks = [];

    for (let sentence of sentences) {
      const words = sentence.split(/\s+/).filter(Boolean);
      let currentChunk = [];

      for (let word of words) {
        currentChunk.push(word);

        // Decide when to cut a chunk
        if (currentChunk.length >= this.options.maxChunkWords ||
            (currentChunk.length >= this.options.minChunkWords && Math.random() < 0.4)) {

          chunks.push(this._formatChunk(currentChunk));
          currentChunk = [];
        }
      }

      // Remaining words
      if (currentChunk.length > 0) {
        chunks.push(this._formatChunk(currentChunk));
      }
    }

    // Step 3: Join with breathing space + occasional natural pauses
    let result = chunks.join('\n\n');

    // Add some flowing connectors occasionally
    result = this._addFlowPauses(result);

    return result;
  }

  _formatChunk(words) {
    let chunk = words.join(' ');

    if (!this.options.preserveCase) {
      // Gentle lowercase with occasional natural caps (feels more "thought-like")
      chunk = chunk.toLowerCase();
      // Capitalize after strong pauses or randomly for rhythm
      if (Math.random() < 0.25) {
        chunk = chunk[0].toUpperCase() + chunk.slice(1);
      }
    }

    return chunk.trim();
  }

  _addFlowPauses(text) {
    const lines = text.split('\n');
    const pausedLines = lines.map((line, i) => {
      if (line.trim() === '') return line;

      // Add pause at end sometimes
      if (Math.random() < this.options.pauseChance) {
        const pauses = ['...', ' —', ' . . .', ' –'];
        return line + pauses[Math.floor(Math.random() * pauses.length)];
      }

      // Occasional mid-line flow break (em dash)
      if (line.length > 25 && Math.random() < 0.2) {
        const words = line.split(' ');
        const breakPoint = Math.floor(words.length * 0.6);
        words.splice(breakPoint, 0, '—');
        return words.join(' ');
      }

      return line;
    });

    return pausedLines.join('\n');
  }

  // Convenience static method
  static transform(text, options) {
    return new FluxSpeak(options).transform(text);
  }
}

module.exports = FluxSpeak;
