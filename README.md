# freeflow

Makes text read as if the words were already your own thoughts.

No LLM. No hardcoded words. No language assumptions.  
Works on structure alone — punctuation, sentence weight, rhythm, line breaks.

---

## How it works

Reading friction is structural, not lexical. The reader stumbles when:

- a sentence front-loads complexity before its payoff
- a clause nests inside a clause, forcing the reader to hold state
- a line break cuts a thought before it lands
- every sentence weighs the same, creating drone

`freeflow` measures these properties and moves things until they resolve.
It never reads a word. It reads shape.

---

## Install

```sh
npm install freeflow
```

---

## Usage

```js
const { transform, analyse } = require('freeflow');

const result = transform(text);
```

With options:

```js
const result = transform(text, {
  lineBreaks:         true,  // join wrapped or broken lines
  sentences:          true,  // split heavy sentences, join orphaned fragments
  rhythm:             true,  // break monotone paragraph rhythm
  maxSentenceWeight:  80,    // character weight before a sentence is split
  minFragmentWeight:  12,    // character weight below which a sentence is a fragment
});
```

Diagnose before/after:

```js
const metrics = analyse(text);
// {
//   sentences:          number,
//   avgSentenceWeight:  number,   // lower is lighter to read
//   rhythmScore:        number,   // 0 = monotone  ·  ~0.4 = flow zone  ·  1 = chaotic
//   avgFrontLoadScore:  number,   // lower means ideas arrive before their qualifiers
//   hardLineBreaks:     number    // line breaks that cut mid-thought
// }
```

---

## What each pass does

**`lineBreaks`**  
Detects two kinds of mid-thought line break: a prose-wrapped line (long, continues lowercase) is space-joined invisibly; a short intentional break (poem, transcript) is joined with an em-dash — a pause that reads forward, not backward.

**`sentences`**  
Finds the last clause-break punctuation in the first two-thirds of a heavy sentence and splits there. Joins sentence fragments that are too short to land on their own. Capitalisation is only applied where the character has a case variant, so CJK and other scripts are untouched.

**`rhythm`**  
Measures standard deviation of sentence weights within each paragraph. When three adjacent sentences fall within 10% of each other, a local swap introduces variance. The goal is ~0.4 — enough difference to feel alive, not enough to feel broken.

---

## Language support

All operations use Unicode-aware punctuation matching and character-weight counting.
No word lists. No language detection. Tested on Latin, Cyrillic, Arabic, CJK, Devanagari.

---

## License

MIT
