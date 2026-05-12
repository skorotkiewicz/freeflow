const { transform, analyse } = require("./freeflow");

const hr = (label) => console.log(`\n${"─".repeat(52)}\n  ${label}\n${"─".repeat(52)}`);

function show(label, original, opts = {}) {
  const result = transform(original, opts);
  const before = analyse(original);
  const after  = analyse(result);

  hr(`BEFORE — ${label}`);
  console.log(original.trim());
  console.log(`\n  metrics: avgWeight=${before.avgSentenceWeight.toFixed(0)}  rhythm=${before.rhythmScore.toFixed(2)}  frontLoad=${before.avgFrontLoadScore.toFixed(2)}  hardBreaks=${before.hardLineBreaks}`);

  hr(`AFTER — ${label}`);
  console.log(result);
  console.log(`\n  metrics: avgWeight=${after.avgSentenceWeight.toFixed(0)}  rhythm=${after.rhythmScore.toFixed(2)}  frontLoad=${after.avgFrontLoadScore.toFixed(2)}  hardBreaks=${after.hardLineBreaks}`);
}

// ── 1. English: front-loaded academic prose ───────────────────────────────
show("English — dense prose", `
Although the precise mechanisms by which syntactic complexity imposes a burden
upon working memory remain a subject of ongoing investigation, it is generally
accepted that sentences which foreground subordinate clauses, or which delay
the arrival of the main predicate, increase processing effort significantly.
This matters for writers. It matters for readers too.
`);

// ── 2. German: long nested clause ─────────────────────────────────────────
show("German — nested clause", `
Im Hinblick auf die Tatsache, dass die Verarbeitung personenbezogener Daten
im Rahmen der geltenden datenschutzrechtlichen Bestimmungen zu erfolgen hat,
ist es unabdingbar, dass alle betroffenen Mitarbeiterinnen und Mitarbeiter
über die entsprechenden Maßnahmen informiert werden.
`);

// ── 3. Poem with enjambment breaks ────────────────────────────────────────
show("Poem — enjambment", `
The light falls slow across the floor
and lingers where your chair once stood.
I have not moved it. Silence fills
the space that should be warm with sound.

Perhaps tomorrow I will open
windows, let the cold air in.
For now the dust sits still as waiting.
`, { rhythm: false });  // don't reorder poem lines

// ── 4. Monotone paragraph (all same length) ───────────────────────────────
show("Prose — monotone rhythm", `
The system starts each morning. It checks the queue for new tasks.
It processes each item in order. It logs the result to the database.
It moves on to the next item. It repeats until the queue is empty.
It then sleeps for thirty seconds before checking again.
`);
