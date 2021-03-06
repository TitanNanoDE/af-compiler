const compile = require('./compile');
const link = require('./link');
const Through = require('through2');
const Path = require('path');

module.exports = function({ cacheDir, compilers, extensions, linkExtensions, outDir }) {

    return function({ module, entry, context, target = 'web' }) {
        let compileCache = null;

        context = context || Path.dirname(entry);
        compileCache = Path.resolve(cacheDir, `./${Path.basename(context)}`);

        const startCompileProcess = function(linkParalel = false) {
            let compilerConfig = {
                output: compileCache,
                moduleName: module,
                entryFile: entry,
                compilerList: compilers,
                extensions: extensions,
                context: context,
            };

            let linkerConfig = {
                context: Path.resolve(compileCache),
                entry: { [module]: Path.resolve(compileCache, Path.relative(context, Path.resolve(entry))) },
                devtool: 'source-map',
                target: target,
                paralelLinking: linkParalel,
                output: {
                    pathinfo: true,
                    path: Path.resolve(outDir),
                    filename: '[name].js',
                },
                resolve: {
                    extensions: linkExtensions || extensions,
                },

            };

            compile(compilerConfig);
            return link(linkerConfig);
        };

        if (entry) {
            return startCompileProcess();
        } else {
            return Through.obj(function (file, encoding, callback) {
                entry = file.path;
                startCompileProcess(true)
                    .then(callback)
                    .catch(() => callback(new Error('Compilation Failed!')));

                this.push(file);
                return true;
            });
        }
    };

};
