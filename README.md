# AF Compiler [![Codacy Badge](https://api.codacy.com/project/badge/Grade/f55cc2a453454dfbaf4fd8b62f82b2a3)](https://www.codacy.com/app/TitanNanoDE/af-compiler?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=TitanNanoDE/af-compiler&amp;utm_campaign=Badge_Grade)

This compiler compiles any project that targets a JavaScript runtime. 
Other files than source code, like sass or less, can also be required and compiled in your project, even though it's not recommended.

The compiler is able to be used in a gulp `.pipe()`, but it is not required to use it that way.
 (Don't `.pipe(Gulp.dest(...))` since the compiler will already write the resulting bundles.)

## Installation
```
npm i --save-dev @af-modules/compiler
```

## How to use
```JavaScript
const compilerBuilder = require('@af-modules/compiler');

const compilerConfig = { 
    cacheDir: '.cache/', 
    compilers: ['js'],
    extensions: ['js'],
    linkExtensions: ['js'], 
    outDir: 'dist/',
};

const compiler = compilerBuilder(compilerConfig);

compiler({
    module: 'app',
    entry: 'src/app.js',
    context: 'src/',
    target: 'web',
});
```
