const Compiler = require('./main');

const entryFile = './test-data/main.js';

const compiler = Compiler({
    compilers: ['sass', 'typescript'],
    outDir: './dist/',
    extensions: ['.js', '.ts', '.scss', '.css'],
    linkExtensions: ['.js', '.css'],
    cacheDir: './.caches/',
});

compiler({
    module: 'test-module',
    entry: entryFile,
    target: 'web',
    context: './test-data/',
}).then(() => process.exit(0));
