/**
 * freeflow
 *
 * Makes text read as if the words were already your own thoughts.
 *
 * No LLM. No hardcoded words. No language assumptions.
 * Works in any script, any language, any genre.
 *
 * The engine operates entirely on structure:
 *   - punctuation patterns
 *   - sentence length and variance
 *   - clause ordering (where the subject arrives)
 *   - paragraph rhythm
 *   - line break placement
 *
 * It never reads a word. It reads shape.
 */

// ─── Unicode-safe sentence splitting ─────────────────────────────────────
// Works for Latin, Cyrillic, Arabic, CJK, Devanagari, etc.
// Splits on universal sentence-ending punctuation + whitespace.

const SENTENCE_END = /([.!?…。！？؟।۔\u3002\uFE52\uFF0E\uFF61]+[\s\n]+)/gu;

function splitSentences(text) {
  const parts = [];
  let last = 0;
  let match;
  const re = new RegExp(SENTENCE_END.source, "gu");

  while ((match = re.exec(text)) !== null) {
    const sentence = text.slice(last, match.index + match[0].length).trim();
    if (sentence) parts.push(sentence);
    last = match.index + match[0].length;
  }

  const tail = text.slice(last).trim();
  if (tail) parts.push(tail);

  return parts;
}

// ─── Structural analysis ──────────────────────────────────────────────────

/**
 * Count characters excluding whitespace — a language-agnostic
 * proxy for sentence "weight".
 */
function weight(sentence) {
  return sentence.replace(/\s/g, "").length;
}

/**
 * Count how many clause-opening punctuation marks appear before
 * the midpoint of the sentence. A high ratio means the reader is
 * forced to hold state before the main idea arrives.
 *
 * Clause markers: , ; : ( [ — / •
 * Universal across Latin scripts and most others.
 */
function frontLoadScore(sentence) {
  const mid = Math.floor(sentence.length / 2);
  const firstHalf = sentence.slice(0, mid);
  const clauseMarkers = (firstHalf.match(/[,;:([\-—\/•]/g) || []).length;
  return clauseMarkers / Math.max(1, mid / 10);
}

/**
 * Measure how "jagged" a set of sentence weights is.
 * Monotony (all same length) and wild swings both hurt rhythm.
 * Returns a score 0-1 where ~0.3–0.6 is the flow zone.
 */
function rhythmScore(sentences) {
  if (sentences.length < 2) return 1;
  const weights = sentences.map(weight);
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);
  // Normalise: stdDev as fraction of mean
  return Math.min(1, stdDev / Math.max(1, mean));
}

/**
 * Detect whether a line break cuts mid-thought:
 * the line ends without sentence-ending punctuation.
 */
function isHardBreak(line) {
  const trimmed = line.trimEnd();
  return trimmed.length > 0 && !/[.!?…。！？؟।۔\u3002,;:\-—]$/.test(trimmed);
}

// ─── Transformations ──────────────────────────────────────────────────────

/**
 * Split an overloaded sentence at its natural joint.
 *
 * Strategy: find the last clause-break punctuation in the first 2/3
 * of the sentence. Split there. The second fragment becomes its own sentence
 * with a capitalised (if Latin) first character.
 *
 * Language-agnostic: capitalisation only applies when the character
 * has a toUpperCase variant (i.e. Latin/Cyrillic scripts). CJK etc. untouched.
 */
function splitOverloaded(sentence, maxWeight = 80) {
  if (weight(sentence) <= maxWeight) return [sentence];

  // Find the best split point: last [,;:—] before the 2/3 mark
  const splitZoneEnd = Math.floor(sentence.length * 0.67);
  const splitZoneStart = Math.floor(sentence.length * 0.25);

  let bestIdx = -1;
  for (let i = splitZoneEnd; i >= splitZoneStart; i--) {
    if (/[,;:—]/.test(sentence[i]) && sentence[i + 1] === " ") {
      bestIdx = i;
      break;
    }
  }

  if (bestIdx === -1) return [sentence]; // no good split point found

  const left = sentence.slice(0, bestIdx).trim();
  let right = sentence.slice(bestIdx + 1).trim();

  // Capitalise first character if it has a case (Latin, Cyrillic)
  if (right.length > 0) {
    const upper = right[0].toUpperCase();
    if (upper !== right[0]) {
      right = upper + right.slice(1);
    }
  }

  // Ensure left ends with a period if it doesn't already end with punctuation
  const leftEnds = /[.!?…。！？؟]$/.test(left);
  return [leftEnds ? left : left + ".", right];
}

/**
 * Join two sentences that are both very short — fragments that feel
 * incomplete on their own. Join with a comma and lowercase the second
 * start only if it has a lowercase variant (avoids breaking proper nouns
 * and CJK where case doesn't exist).
 */
function joinFragments(sentences, minWeight = 12) {
  const result = [];
  let i = 0;

  while (i < sentences.length) {
    const curr = sentences[i];
    const next = sentences[i + 1];

    if (
      next &&
      weight(curr) < minWeight &&
      weight(next) < minWeight &&
      // Don't join if curr ends with ! or ? — those are intentional punches
      /[.,;]$/.test(curr)
    ) {
      // Strip the trailing comma/period from curr, join with comma
      const left = curr.replace(/[.,;]+$/, "");
      let right = next.replace(/^([.!?])\s*/, ""); // strip leading punct
      // Lowercase first char of right if it has a case
      const lower = right[0]?.toLowerCase();
      if (lower && lower !== right[0]) right = lower + right.slice(1);
      result.push(left + ", " + right);
      i += 2;
    } else {
      result.push(curr);
      i++;
    }
  }

  return result;
}

/**
 * Reorder sentences within a paragraph so rhythm flows:
 * short → longer → short (wave pattern).
 *
 * This is not sorting — it's a single-pass local swap.
 * If two adjacent sentences have inverted weight AND the inversion
 * creates a monotone run, swap them.
 *
 * Preserves meaning because adjacent sentences in expository prose
 * often have swappable order. Does NOT reorder across paragraph breaks.
 */
function smoothRhythm(sentences) {
  if (sentences.length < 3) return sentences;

  const result = [...sentences];
  const weights = result.map(weight);

  for (let i = 1; i < result.length - 1; i++) {
    const prev = weights[i - 1];
    const curr = weights[i];
    const next = weights[i + 1];

    // Detect a flat run: three sentences within 10% of each other
    const range = Math.max(prev, curr, next) - Math.min(prev, curr, next);
    const mean = (prev + curr + next) / 3;
    if (range / Math.max(1, mean) < 0.1) {
      // Introduce variance: swap curr and next if next is shorter
      if (next < curr) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        weights[i] = weight(result[i]);
        weights[i + 1] = weight(result[i + 1]);
      }
    }
  }

  return result;
}

/**
 * Fix line breaks that cut mid-thought.
 *
 * Two distinct cases:
 *
 * A) PROSE WRAP — a long sentence broken across lines by a text editor or
 *    formatter (soft wrap). The next line starts lowercase or mid-clause.
 *    → Join with a single space. Invisible to the reader.
 *
 * B) INTENTIONAL BREAK — a short line ending without punctuation where the
 *    next line starts a new clause or continues a poetic thought.
 *    → Join with an em-dash: a breath pause that reads forward.
 *
 * Blank lines (paragraph/stanza breaks) are always preserved.
 *
 * Heuristic to tell them apart:
 *   - If the current line is "long" (>50 chars) and the next line starts
 *     with a lowercase letter → prose wrap → space join.
 *   - Otherwise → intentional break → em-dash join.
 */
function flowLineBreaks(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let carry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const blank = line.trim() === "";

    if (blank) {
      if (carry !== null) { out.push(carry); carry = null; }
      out.push("");
      continue;
    }

    if (carry === null) {
      carry = line;
      continue;
    }

    if (isHardBreak(carry)) {
      const nextStart = line.trimStart()[0] ?? "";
      const isProseWrap =
        carry.trimEnd().length > 50 &&
        nextStart === nextStart.toLowerCase() &&
        nextStart !== nextStart.toUpperCase(); // has a lowercase form (Latin/Cyrillic)

      if (isProseWrap) {
        carry = carry.trimEnd() + " " + line.trimStart();
      } else {
        carry = carry.trimEnd() + " \u2014 " + line.trimStart();
      }
    } else {
      out.push(carry);
      carry = line;
    }
  }

  if (carry !== null) out.push(carry);
  return out.join("\n");
}

// ─── Paragraph-level processor ────────────────────────────────────────────

function processParagraph(paragraph, opts) {
  const { maxSentenceWeight, minFragmentWeight, smoothRhythm: doSmooth } = opts;

  let sentences = splitSentences(paragraph);
  if (sentences.length === 0) return paragraph;

  // 1. Split overloaded sentences
  sentences = sentences.flatMap(s => splitOverloaded(s, maxSentenceWeight));

  // 2. Join orphaned fragments
  sentences = joinFragments(sentences, minFragmentWeight);

  // 3. Smooth rhythm (optional — off for poetry)
  if (doSmooth) sentences = smoothRhythm(sentences);

  return sentences.join(" ");
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} FreeflowOptions
 * @property {boolean} [lineBreaks=true]      Fix mid-thought line breaks
 * @property {boolean} [sentences=true]       Split/join sentences by weight
 * @property {boolean} [rhythm=true]          Smooth paragraph rhythm
 * @property {number}  [maxSentenceWeight=80] Char weight before a sentence is split
 * @property {number}  [minFragmentWeight=12] Char weight below which a sentence is a fragment
 */

/**
 * Transform text for cognitive reading flow.
 * Language-agnostic. No LLM. No hardcoded words.
 *
 * @param {string} text
 * @param {FreeflowOptions} [opts]
 * @returns {string}
 */
function transform(text, opts = {}) {
  const {
    lineBreaks = true,
    sentences = true,
    rhythm = true,
    maxSentenceWeight = 80,
    minFragmentWeight = 12,
  } = opts;

  let out = text;

  // Step 1: fix line breaks first (works on raw text)
  if (lineBreaks) out = flowLineBreaks(out);

  // Step 2: process each paragraph independently
  if (sentences || rhythm) {
    out = out
      .split(/\n\n+/)
      .map(para => {
        const trimmed = para.trim();
        if (!trimmed) return "";
        return processParagraph(trimmed, {
          maxSentenceWeight,
          minFragmentWeight,
          smoothRhythm: rhythm,
        });
      })
      .join("\n\n");
  }

  return out.trim();
}

/**
 * Analyse a text and return structural metrics.
 * Useful for debugging or building UIs that show before/after.
 *
 * @param {string} text
 * @returns {Object}
 */
function analyse(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const allSentences = paragraphs.flatMap(p => splitSentences(p));
  const weights = allSentences.map(weight);
  const frontLoads = allSentences.map(frontLoadScore);
  const lines = text.split(/\r?\n/);
  const hardBreaks = lines.filter(isHardBreak).length;

  return {
    paragraphs: paragraphs.length,
    sentences: allSentences.length,
    avgSentenceWeight: weights.reduce((a, b) => a + b, 0) / Math.max(1, weights.length),
    maxSentenceWeight: Math.max(...weights),
    rhythmScore: rhythmScore(allSentences),   // 0=monotone, 1=wild, ~0.4 is good
    avgFrontLoadScore: frontLoads.reduce((a, b) => a + b, 0) / Math.max(1, frontLoads.length),
    hardLineBreaks: hardBreaks,
  };
}

module.exports = { transform, analyse, splitSentences, weight, frontLoadScore, rhythmScore };
