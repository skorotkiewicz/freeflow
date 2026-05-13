import { freeRead } from './freeread.js';

const poem = `The moon rises slowly
casting silver on the water
a quiet breath
before the night begins`;

console.log(freeRead(poem));
/*
Output:
The moon rises · slowly casting ~ silver on the ~ water a quiet · breath before ~ the night ~ begins …
*/
