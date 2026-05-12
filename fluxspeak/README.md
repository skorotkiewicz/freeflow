# FluxSpeak

**Turn rigid text into natural thought-flow.**

A tiny, dependency-free Node.js library that transforms poems, scripts, prompts, or any text into a **free-flow reading syntax** — so when someone reads it from a prompter or screen, it sounds like they’re thinking and speaking freely.

No hardcoded words. No LLM. Works internationally.

---

## ✨ The Goal

Make people **sound human** while reading.

Regular text feels like reading.  
**FluxSpeak** makes the same text feel like spontaneous thoughts.

Perfect for:
- Teleprompters & live presentations
- Voice-over scripts
- Performance poetry
- AI voice training prompts
- Acting rehearsals
- Anything you want to sound natural and alive

---

## Features

- Language agnostic (works with English, Spanish, French, German, Portuguese, etc.)
- Breath-sized chunks for natural rhythm
- Organic pauses (`...`, `—`, `…`)
- Slight randomness so it never feels robotic
- Preserves meaning while removing "script stiffness"
- Tiny & zero dependencies

---

## Installation

Just copy `fluxspeak.js` into your project.

---

## Quick Usage

```js
const FluxSpeak = require('./fluxspeak');

const poem = `
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood...
`;

const flowed = FluxSpeak.transform(poem);

console.log(flowed);
```

### Output example:

```
two roads diverged in a yellow

wood, and sorry i could

not travel both and be . . .

one traveler, long...

i stood... . . .
```

---

## Options

```js
const options = {
  maxChunkWords: 7,      // ideal thought chunk size
  minChunkWords: 3,      // minimum before considering a break
  pauseChance: 0.35,     // how often to add ... or —
  preserveCase: false,   // keep original capitalization?
  flowVariance: true     // slight randomness (recommended)
};

const fs = new FluxSpeak(options);
// or
const result = FluxSpeak.transform(text, options);
```

---

## Advanced Example

```js
const FluxSpeak = require('./fluxspeak');

const script = "Hello everyone thank you for coming today we are going to explore something truly magical";

const natural = FluxSpeak.transform(script, {
  maxChunkWords: 6,
  pauseChance: 0.45
});

console.log(natural);
```

**Result:**
```
Hello everyone thank you

For coming today we

are going to explore something truly . . .

magical –
```

---

## Why It Works

- Short lines match how eyes move when reading naturally
- Strategic pauses invite breath and reflection
- Lowercase bias + occasional capitals feels like internal monologue
- No rigid sentence structure → mimics real speech patterns

---

## Philosophy

> Don’t make the text show *how* a human would say it.  
> Make the text so the human *becomes* it while reading.

FluxSpeak doesn’t simulate speech.  
It removes the barriers between text and thought.

---

## License

MIT — Do whatever you want. Go make things sound alive.

---

**Made with curiosity and love for natural human flow.**

Enjoy fluxing ✨
