const FluxSpeak = require('./fluxspeak');

// Example usage
if (require.main === module) {
  const poem = `
    Two roads diverged in a yellow wood,
    And sorry I could not travel both
    And be one traveler, long I stood
    And looked down one as far as I could
    To where it bent in the undergrowth.
  `;

  console.log("=== ORIGINAL ===\n");
  console.log(poem);
  console.log("\n=== FLUXSPEAK (free reading flow) ===\n");
  console.log(FluxSpeak.transform(poem));
}
