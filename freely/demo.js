const Freely = require('./freely');

// ── English ──────────────────────────────────────
const english = `
Roses are red, violets are blue,
Sugar is sweet, and so are you.
The wind whispers through the trees,
And carries sweet memories on the breeze.
`;

// ── French ───────────────────────────────────────
const french = `
Liberté, égalité, fraternité.
Sous le ciel de Paris, les âmes chantent,
Les rues murmurent des histoires anciennes,
Et la lumière danse sur la Seine.
`;

// ── Chinese ──────────────────────────────────────
const chinese = `
床前明月光，疑是地上霜。
举头望明月，低头思故乡。
`;

// ── Spanish ──────────────────────────────────────
const spanish = `
En un lugar de la Mancha, de cuyo nombre no quiero acordarme,
no ha mucho tiempo que vivía un hidalgo.
`;

// ── Russian ──────────────────────────────────────
const russian = `
Мороз и солнце; день чудесный!
Еще ты дремлешь, друг прелестный.
`;

const f = new Freely();

console.log('═══ ENGLISH ═══');
console.log(f.transform(english));
console.log();

console.log('═══ FRENCH ═══');
console.log(f.transform(french));
console.log();

console.log('═══ CHINESE ═══');
console.log(f.transform(chinese));
console.log();

console.log('═══ SPANISH ═══');
console.log(f.transform(spanish));
console.log();

console.log('═══ RUSSIAN ═══');
console.log(f.transform(russian));
