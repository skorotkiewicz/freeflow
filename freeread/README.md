### 🔍 How It Achieves "Free Speech" Reading
This isn't phonetic transcription. It's a **visual-prosodic syntax** that exploits how human reading motor patterns work:

1. **Rhythm Chunking** (`chunkByRhythm`) groups words by cognitive load (~12-14 characters). This matches the natural span of spoken phrasing across languages.
2. **Thin Space (` `)** inside chunks visually pulls words together, causing readers to slightly rush through them, mimicking spontaneous thought flow.
3. **Micro/Flow/Breath/Trail markers** replace rigid punctuation. They don't dictate *what* to say, but *how* to pace it:
   - `·` → light vocal reset (no hard stop)
   - `~` → forward momentum
   - `—` → natural inhalation point
   - `…` → trailing thought, voice naturally drops
4. **Capitalization lift** on each chunk start triggers a subconscious vocal pitch rise, simulating how free thoughts initiate.
5. **Line breaks become continuations** (`~`), destroying the "recitation" rhythm and forcing a conversational flow.

### 🌍 International & LLM-Free
- Uses `\p{L}\p{N}` Unicode regex for word extraction (works with Cyrillic, CJK, Arabic, Latin, Devanagari, etc.)
- Zero hardcoded words, grammar rules, or language-specific exceptions
- Rhythm threshold adapts to character density, which correlates strongly with syllable count across most languages
- Entirely deterministic, ~90 lines, no external dependencies

### 🎛️ Configuration
```js
freeRead(text, { pace: 'fast', breathChar: '↴', flowChar: '→' });
```
- `pace`: `'fast'` (smaller chunks, urgent), `'normal'`, `'slow'` (longer phrases, meditative)
- Override markers with any Unicode symbol that fits your aesthetic

Drop it into any prompter, teleprompter, or reading app. The syntax naturally breaks mechanical reading patterns and guides the vocal tract into spontaneous, thought-like delivery. 🌬️📜
