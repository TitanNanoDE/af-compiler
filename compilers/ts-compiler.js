const ts = require('typescript');

/**
 * [function description]
 *
 * @param  {string} file    [description]
 * @param  {string} context [description]
 * @param  {string} output  [description]
 *
 * @return {[type]}         [description]
 */
const compile = function(file, context, output) {
    let options = {
        sourceMaps: true,
        sourceRoot: context,
        target: 'ES2015',
        outDir: output,
    };

    let program = ts.createProgram(file, options);
    let emitResult = program.emit();

    let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });

    return emitResult.emitSkipped;
};


module.exports = {
    id: 'typescript',
    name: 'TS',
    execute: compile,
    test: /\.ts$/,
};
