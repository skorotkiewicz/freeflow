# freely

> Transform text into free-thought notation. Make people read like they speak freely — their own thoughts flowing, not reciting someone else's words.

## How It Works

The core insight: **rigid structure makes you recite; organic structure makes you think aloud.**

Freely replaces the mechanics of written language (capitals, periods, even spacing) with a notation that guides the inner voice into free-flow:

| Symbol | Name | What it does to your voice |
|--------|------|----------------------------|
| `⌇` | rush | these words flow forward together |
| `·` | breath | soft pause — your natural breath |
| `∿` | wave | thought-wave boundary |
| `∼` | drift | thought trailing, floating away |
| `°` | echo | this word resonates (appeared before) |
| `¿` | ask | open question, lingering |
| `…` | hush | silence — space for your own thought |

## Usage

```javascript
const Freely = require('./freely');

// Default — all features on
const f = new Freely();
console.log(f.transform('Roses are red, violets are blue.'));

// Quick one-liner
const { freely } = require('./freely');
console.log(freely('Hello, world!'));
```

### CLI

```bash
freely "Some text to transform"
cat poem.txt | freely
```

## API

### `new Freely(opts)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `breathMark` | string | `'·'` | Soft pause symbol |
| `driftMark` | string | `'∼'` | Trailing thought symbol |
| `echoMark` | string | `'°'` | Resonance symbol |
| `rushMark` | string | `'⌇'` | Flow-forward symbol |
| `waveMark` | string | `'∿'` | Wave boundary symbol |
| `hushMark` | string | `'…'` | Silence symbol |
| `askMark` | string | `'¿'` | Open question symbol |
| `tempoMark` | string | `'♩'` | Header tempo symbol |
| `decapitalize` | boolean | `true` | Remove capitals (thoughts don't shout) |
| `dissolve` | boolean | `true` | Thoughts drift apart toward the end |
| `resonate` | boolean | `true` | Mark repeated words with echo |
| `spiral` | boolean | `true` | Undulating indentation (thought depth) |
| `silence` | boolean | `true` | Inject hush pauses |
| `header` | boolean | `true` | Show tempo header |

### `freely.transform(text)`

Transforms the input string into Freely notation. Returns a string.

## The Principles

| Written text does | Freely does | Effect on inner voice |
|---|---|---|
| Capitalizes first words | Decapitalizes everything | Removes \"authority\" — feels like your thought |
| Ends with periods | Ends with waves ∿ | Thoughts don't conclude — they pass |
| Even spacing | Variable spacing | Creates organic rhythm, not metronome |
| All words equal | Rush-clusters ⌇ | Some words flow as one breath |
| Repeated words unmarked | Echo marks ° | Subconscious threads between ideas |
| Uniform margins | Spiral indentation | Thoughts expand outward, return inward |
| Text ends definitively | Dissolve ∼ | Thoughts drift, don't conclude |
| Continuous text | Hush pauses … | Space for your own thoughts to arise |

## International

Works automatically with any language. Detects CJK characters for character-level tokenization, and handles Cyrillic, Arabic, Latin diacritics out of the box. No hardcoded words. No LLM.

## Sample Output

**Input:**
```text
Roses are red, violets are blue,
Sugar is sweet, and so are you.
```

**Output:**
```text
♩ ∿

    roses⌇ are° ∿
      violets⌇ are° ∿
  blue ∿
        sugar · is ∿
    sweet ∿
      and⌇ so ∿
  are° you ∿
        …
          ∼ ∿
```

Notice how **are** gets the `°` echo mark — the reader's inner voice naturally connects it back, like a thought returning.

## License

MIT
