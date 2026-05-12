#!/usr/bin/env node

const Freely = require('./freely');
const fs = require('fs');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  freely — transform text into free-thought notation

  Usage:
    freely                     type text, Ctrl+D to transform
    freely < file.txt          transform file contents
    freely "some text"         transform argument
    echo "text" | freely       pipe stdin

  Options:
    --no-dissolve    keep even spacing (no trailing drift)
    --no-spiral      left-align all waves (no indentation)
    --no-resonate    don't mark repeated words
    --no-silence     don't inject hush pauses
    --no-header      omit tempo header
    --no-decapitalize keep original capitalization
  `);
  process.exit(0);
}

const opts = {
  dissolve:     !args.includes('--no-dissolve'),
  spiral:       !args.includes('--no-spiral'),
  resonate:     !args.includes('--no-resonate'),
  silence:      !args.includes('--no-silence'),
  header:       !args.includes('--no-header'),
  decapitalize: !args.includes('--no-decapitalize'),
};

// Find the text argument (first non-flag arg)
const textArg = args.find(a => !a.startsWith('--'));

if (textArg) {
  // Text from argument
  console.log(new Freely(opts).transform(textArg));
} else if (!process.stdin.isTTY) {
  // Piped stdin or file redirect
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    console.log(new Freely(opts).transform(input));
  });
} else {
  // Interactive: read from TTY
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    console.log(new Freely(opts).transform(input));
  });
}
