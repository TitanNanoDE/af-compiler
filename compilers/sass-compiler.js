const Sass = require('node-sass');
const Path = require('path');
const Fs = require('fs');
const mkdirp = require('mkdirp');

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
    output = Path.resolve(output, Path.relative(context, file)).replace(/\.s(ass|css)$/, '.css');

    let options = {
        file: file,
        sourceMap: true,
        outFile: output,
//        sourceMapRoot: context,
    };
    
    let result = Sass.renderSync(options);

    try {
        Fs.accessSync(Path.dirname(output));
    } catch (e) {
        mkdirp.sync(Path.dirname(output));
    }

    Fs.writeFileSync(output, result.css.toString(), 'utf8');
    Fs.writeFileSync(`${output}.map`, result.map.toString(), 'utf8');

//    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);

    return true;
};


module.exports = {
    id: 'sass',
    name: 'SASS',
    execute: compile,
    test: /\.s(ass|css)$/,
};
