/**
 * freely — Transform written text into free-thought notation
 *
 * An invented syntax that makes humans read like they speak freely.
 * When someone reads Freely notation, their inner voice flows
 * naturally — not recites another's words.
 *
 * No LLM. No hardcoded words. International.
 *
 * ━━ Notation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *   ⌇  rush       words that flow forward as one breath
 *   ·  breath     soft pause, your natural breath
 *   ∿  wave       thought-wave boundary
 *   ∼  drift      thought trailing, floating
 *   °  echo       this word resonates (appeared before)
 *   ¿  ask        open question, lingering
 *   …  hush       silence, space for your thought
 *
 *   Spacing carries rhythm:
 *     thin space    — within rush-clusters
 *     en space      — between clusters
 *     em space      — between waves
 *
 * ━━ Principles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *   1. Thoughts don't have periods — they have breaths
 *   2. Some words rush together, some stand alone
 *   3. Repeated ideas resonate (echo mark °)
 *   4. Thoughts drift and dissolve, they don't conclude
 *   5. Rhythm is organic, not metronomic
 *   6. Silence is part of the thought
 */

class Freely {
  /**
   * @param {Object} opts
   * @param {string} [opts.breathMark]   - soft pause symbol (default ·)
   * @param {string} [opts.driftMark]    - trailing thought symbol (default ∼)
   * @param {string} [opts.echoMark]     - resonance symbol (default °)
   * @param {string} [opts.rushMark]     - flow-forward symbol (default ⌇)
   * @param {string} [opts.waveMark]     - wave boundary symbol (default ∿)
   * @param {string} [opts.hushMark]     - silence symbol (default …)
   * @param {string} [opts.askMark]      - open question symbol (default ¿)
   * @param {string} [opts.tempoMark]    - header tempo symbol (default ♩)
   * @param {boolean} [opts.decapitalize=true] - remove capitals (thoughts don't shout)
   * @param {boolean} [opts.dissolve=true]     - thoughts drift apart toward the end
   * @param {boolean} [opts.resonate=true]     - mark repeated words with echo
   * @param {boolean} [opts.spiral=true]       - undulating indentation (thought depth)
   * @param {boolean} [opts.silence=true]      - inject hush pauses
   * @param {boolean} [opts.header=true]       - show tempo header
   */
  constructor(opts = {}) {
    // ── Symbol palette ──
    this.mark = {
      breath: opts.breathMark ?? '·',
      drift:  opts.driftMark  ?? '∼',
      echo:   opts.echoMark   ?? '°',
      rush:   opts.rushMark   ?? '⌇',
      wave:   opts.waveMark   ?? '∿',
      hush:   opts.hushMark   ?? '…',
      ask:    opts.askMark    ?? '¿',
      tempo:  opts.tempoMark  ?? '♩',
    };

    // ── Spacing palette ──
    this.gap = {
      hair:  '\u200A', // hair space — syllables nearly merge
      rush:  '\u2009', // thin space — words flow as one
      pause: '\u2002', // en space   — breath between clusters
      rest:  '\u2003', // em space   — rest between waves
    };

    // ── Behavior ──
    this.decapitalize = opts.decapitalize !== false;
    this.dissolve     = opts.dissolve !== false;
    this.resonate     = opts.resonate !== false;
    this.spiral       = opts.spiral !== false;
    this.silence      = opts.silence !== false;
    this.header       = opts.header !== false;
  }

  /**
   * Transform text into Freely notation
   * @param {string} text — any text in any language
   * @returns {string} — text rendered in Freely notation
   */
  transform(text) {
    if (!text?.trim()) return '';

    const tokens = this._lex(text);
    if (!tokens.length) return '';

    const resonant = this._resonance(tokens);
    const waves = this._waves(tokens, resonant);
    return this._render(waves);
  }


  // ═══════════════════════════════════════════════════
  //  LEXICAL ANALYSIS
  // ═══════════════════════════════════════════════════

  _lex(text) {
    // Detect CJK-dominant text without word-spacing
    const chars     = [...text.replace(/\s/g, '')];
    const cjkCount  = chars.filter(c =>
      /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF]/.test(c)
    ).length;
    const spaceCount = (text.match(/\s/g) || []).length;
    const needCharLevel = cjkCount > chars.length * 0.25
                       && spaceCount < chars.length * 0.12;

    // Paragraph breaks → hard boundaries
    const prepared = text.replace(/\n\s*\n/g, ' ¶ ');

    return needCharLevel
      ? this._lexByChar(prepared)
      : this._lexByWord(prepared);
  }

  /**
   * Word-level tokenization (Latin, Cyrillic, Greek, Korean, etc.)
   */
  _lexByWord(text) {
    return text.split(/\s+/).filter(Boolean).map(raw => {
      const trail = {
        stop:    /[.!?。！？︕︖¶]+$/.test(raw),
        pause:   /[,;،、；：:]+$/.test(raw),
        ask:     /[?？︖]+$/.test(raw),
        exclaim: /[!！︕]+$/.test(raw),
      };

      // Strip punctuation — thoughts don't carry it
      const stripped = raw.replace(
        /[.,;:!?()""''«»„""‚‛¿¡。，、；：！？（）【】《》…—–\-\u3001\u3002\uFF01\uFF1F\u00AB\u00BB\u201C-\u201D\u2018-\u2019¶]/g,
        ''
      );

      return {
        word:   this.decapitalize ? stripped.toLowerCase() : stripped,
        weight: this._weight(stripped),
        ...trail,
      };
    }).filter(t => t.word.length > 0);
  }

  /**
   * Character-level tokenization (Chinese, Japanese without word-spacing)
   * Each character is a token — each ≈ one syllable
   */
  _lexByChar(text) {
    const tokens = [];
    const BOUNDARY = {
      stop:    /[.!?。！？︕︖¶]/,
      pause:   /[,،、；：:;，]/,
      ask:     /[?？︖]/,
      exclaim: /[!！︕]/,
      skip:    /[""''【】《》…—–\-()«»„""‚‛\s\u3001\u3002\u00AB\u00BB\u201C-\u201D\u2018-\u2019¶]/,
    };

    for (const ch of text) {
      if (BOUNDARY.skip.test(ch)) continue;

      // Boundary punctuation → mark the previous token
      if (BOUNDARY.stop.test(ch) || BOUNDARY.pause.test(ch)) {
        if (tokens.length) {
          const prev = tokens[tokens.length - 1];
          if (BOUNDARY.stop.test(ch))    prev.stop    = true;
          if (BOUNDARY.pause.test(ch))   prev.pause   = true;
          if (BOUNDARY.ask.test(ch))     prev.ask     = true;
          if (BOUNDARY.exclaim.test(ch)) prev.exclaim = true;
        }
        continue;
      }

      // Regular character → token with weight 1
      tokens.push({
        word:   this.decapitalize ? ch.toLowerCase() : ch,
        weight: 1,
        stop: false, pause: false, ask: false, exclaim: false,
      });
    }

    return tokens;
  }


  // ═══════════════════════════════════════════════════
  //  WEIGHT (syllable proxy, script-aware)
  // ═══════════════════════════════════════════════════

  _weight(word) {
    if (!word) return 1;
    const chars = [...word];

    // CJK: each character ≈ 1 syllable
    const cjk = chars.filter(c =>
      /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(c)
    ).length;
    if (cjk >= chars.length * 0.25) return Math.max(cjk, 1);

    // Alphabetic: vowel count ≈ syllable count
    // Covers Latin, Cyrillic, Greek + common diacritics
    const v = (word.match(
      /[aeiouyàáâãäåæèéêëìíîïòóôõöøùúûüýÿāăąēęīĭįōőœũūŭůűųǎǐǒǔǖǘǚǜǝəɛɵʊʌаоуыэяёюиеіїєґεηιουω]/gi
    ) || []).length;
    if (v > 0) return Math.max(v, 1);

    // Fallback for unhandled scripts
    return Math.max(Math.ceil(chars.length / 2), 1);
  }


  // ═══════════════════════════════════════════════════
  //  RESONANCE (repeated words echo)
  // ═══════════════════════════════════════════════════

  _resonance(tokens) {
    const freq = {};
    for (const t of tokens) {
      if (t.word) freq[t.word] = (freq[t.word] || 0) + 1;
    }
    return new Set(
      Object.entries(freq)
        .filter(([, n]) => n > 1)
        .map(([w]) => w)
    );
  }


  // ═══════════════════════════════════════════════════
  //  WAVE SHAPING
  //  Break text into thought-waves — organic units
  //  that mirror how thoughts naturally arise and pass
  // ═══════════════════════════════════════════════════

  _waves(tokens, resonant) {
    const waves = [];
    let wave = [];
    let waveWt = 0;
    let spiralI = 0;

    const seal = (type) => {
      if (!wave.length) return;
      waves.push({ tokens: wave, spiral: spiralI++, type });
      wave = [];
      waveWt = 0;
    };

    for (const t of tokens) {
      t.resonant = resonant.has(t.word);
      wave.push(t);
      waveWt += t.weight;

      if (t.stop) {
        seal(t.ask ? 'ask' : t.exclaim ? 'ring' : 'breath');
      } else if (t.pause) {
        // Comma/semicolon = natural thought boundary
        seal('flow');
      } else if (waveWt >= 12) {
        // Long unbroken text needs breathing room
        seal('flow');
      }
    }
    seal('flow');

    return waves;
  }


  // ═══════════════════════════════════════════════════
  //  RUSH-CLUSTERING
  //  Group words that flow as one breath-unit.
  //  Resonant words break clusters — they stand alone,
  //  demanding attention.
  // ═══════════════════════════════════════════════════

  _cluster(tokens) {
    const out = [];
    let cur = [];

    for (const t of tokens) {
      // Resonant words get their own cluster — they echo
      if (t.resonant && cur.length > 0) {
        out.push(cur);
        cur = [t];
        continue;
      }

      cur.push(t);
      const wt = cur.reduce((s, w) => s + w.weight, 0);

      // Cluster size: 2-3 words or ~5 syllable-weights
      if (cur.length >= 3 || (cur.length >= 2 && wt >= 5)) {
        out.push(cur);
        cur = [];
      }
    }

    // Collect stragglers
    if (cur.length) {
      if (out.length && cur.length === 1) {
        out[out.length - 1].push(...cur);
      } else {
        out.push(cur);
      }
    }

    return out;
  }


  // ═══════════════════════════════════════════════════
  //  RENDER
  //  Transform shaped waves into Freely notation
  // ═══════════════════════════════════════════════════

  _render(waves) {
    const total = waves.length;
    const lines = [];

    // ── Tempo header ──
    if (this.header) {
      lines.push(`${this.mark.tempo} ${this.mark.wave}`);
      lines.push('');
    }

    // ── Render each thought-wave ──
    for (let wi = 0; wi < total; wi++) {
      const wave = waves[wi];
      const progress = total > 1 ? wi / (total - 1) : 0;
      const d = this.dissolve ? progress : 0;

      let line = '';

      // Spiral indentation — sinusoidal thought depth
      // Thoughts expand outward, then return inward
      if (this.spiral) {
        const depth = Math.max(1, Math.round(
          Math.sin(wave.spiral * 0.8) * 1.2 + 2
        ));
        line += '  '.repeat(depth);
      }

      // ── Render rush-clusters ──
      const clusters = this._cluster(wave.tokens);

      for (let ci = 0; ci < clusters.length; ci++) {
        const cluster = clusters[ci];

        // Words in a cluster rush together (thin spaces)
        const text = cluster.map(t => {
          let w = t.word;
          if (this.resonate && t.resonant) w += this.mark.echo;
          return w;
        }).join(this.gap.rush);

        line += text;

        // Inter-cluster rhythm markers
        // Alternating: rush → breath → space → rush → ...
        if (ci < clusters.length - 1) {
          const rMark = [this.mark.rush, this.mark.breath, ''][ci % 3];

          // Dissolve widens gaps over time
          const gap = d > 0.4
            ? this.gap.pause + this.gap.pause
            : this.gap.pause;

          line += gap + rMark + (rMark ? this.gap.rush : '');
        }
      }

      // ── Wave ending ──
      switch (wave.type) {
        case 'ask':    line += this.gap.rest + this.mark.ask;    break;
        case 'ring':   line += this.gap.rest + this.mark.echo;   break;
        case 'breath': line += this.gap.rest + this.mark.wave;   break;
        default:       line += this.gap.pause  + this.mark.breath;
      }

      // ── Dissolve: thoughts drift apart ──
      if (d > 0.35) {
        const n = Math.ceil((d - 0.35) * 5);
        line += this.gap.rest
             + Array(n).fill(this.mark.drift).join(this.gap.rush);
      }

      lines.push(line);

      // ── Silence injection: occasional hush line ──
      // Creates space for the reader's own thoughts to arise
      if (this.silence && wi > 0 && wi < total - 1) {
        if (wi % 4 === 3 && d > 0.15) {
          const depth = this.spiral
            ? Math.max(1, Math.round(Math.sin(wave.spiral * 0.8) * 1.2 + 2.5))
            : 1;
          lines.push('');
          lines.push('  '.repeat(depth) + this.mark.hush);
          lines.push('');
        }
      }
    }

    // ── Closing ──
    if (total > 2) {
      lines.push('');
      lines.push(`  ${this.mark.drift} ${this.mark.wave}`);
    }

    return lines.join('\n');
  }
}


// ═══════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════

module.exports = Freely;

/** Quick transform without instantiation */
module.exports.freely = (text, opts) => new Freely(opts).transform(text);
