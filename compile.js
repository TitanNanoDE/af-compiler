const Colors = require('colors');
const Fs = require('fs');
const Path = require('path');
const Copy = require('./compilers/js-copy');
const Glob = require('glob');

/**
 * @name CompilerInfo
 * @property {string} name the name of the compiler
 * @property {RegEx} test the regular expression against the file name should be
 *                        tested against in order to decided if it has to be
 *                        compiled with this compiler,
 * @property {Function} execute a function to invoce the compiler.
 * @property {string} context
 */

// const fileExtWhiteList = [/\.js(x)?$/, /\.ts$/];

/**
 * [analyze description]
 *
 * @param  {string} entryFile path to the entry file of the module
 * @param  {string} root      the root directory of the module
 *
 * @return {[type]}           [description]
 */
const analyze = function(entryFile, context, extensions) {
    const normalIncludes = /(?!\/\/)[^\/]*import(?:[ ]+[a-zA-Z0-9_\$]*[ ]+from)?[ ]+(?:'([^']+)'|"([^"]+)")(?:$|;(?:[^"$;]*"[^";$]*"|[^'$;]*'[^';$]*')*[^"'$;]*$)/gm;
    const advancedIncludes = /(?!\/\/)[^\/]*import[ ]+(?:{(?:[^"'}]|"[^"}]*"|'[^'}]*')*}(?:[ ]+as[ ]+[a-zA-Z0-9_\$]+)?|\*[ ]+as[ ]+[a-zA-Z0-9_\$]+)[ ]+from[ ]+(?:'|")([^'"]*)(?:'|")(?:$|;(?=(?:(?:[^"$;]*"[^";$]*")|([^'$;]*'[^';$]*'))*[^"$;]*$))/gm;
    const requires = /(?!\/\/)[^\/]*require\((?:"([^"]*)"|'([^']*)')\)(?=(?:[^"$]*"[^"$]*"|[^'$]*'[^"$]*')*[^"'$]*$)/gm;
    const reExports = /^\s*export .* from (?:"|')([^"']*)(?:'|")/gm;

    const patterns = [normalIncludes, advancedIncludes, requires, reExports];

    const includes = [];
    const discovered = [];
    const queue = [entryFile];

    while (queue.length > 0) {
        let path = queue.shift();
        let file = null;
        let actualFilePath = null;

        const possibleFiles = extensions.map(extension => `${path}${extension}`);
        possibleFiles.unshift(path);

        for (let i = 0; i < possibleFiles.length; i++) {
            actualFilePath = possibleFiles[i];

            try {
                actualFilePath = require.resolve(actualFilePath);
                file = Fs.readFileSync(actualFilePath, 'utf8');
                break;
            } catch (e) {
                file = null;
            }
        }

        if (file !== null) {
            if (includes.indexOf(actualFilePath) > 0) {
                continue;
            }

            includes.push(actualFilePath);

            patterns.forEach(pattern => {
                let result = null;

                while ((result = pattern.exec(file))) {
                    let dependency = result[1] || result[2];

                    if (dependency.search(/^\.\.?\//) > -1) {
                        dependency = Path.resolve(Path.dirname(actualFilePath), dependency);
                    }

                    if (discovered.indexOf(dependency) < 0 && queue.indexOf(dependency) < 0) {
                        queue.push(dependency);
                        discovered.push(dependency);
                    }
                }
            });
        } else {
            console.error(Colors.red(`${path} does not exist!`));
        }
    }

    return includes;
};

const compilers = {
    'typescript': './compilers/ts-compiler',
    'sass': './compilers/sass-compiler',
};

/**
 * Compiles a file with it's matching compiler.
 *
 * @param  {CompilerInfo[]} compilers [description]
 * @param  {string} moduleName [description]
 *
 * @return {[type]}           [description]
 */
const compileFile = function(fileName, { compilers, moduleName, output, context}) {
    let compiled = false;

    compilers.some((compiler) => {
        if (fileName.search(compiler.test) > 0) {
            console.log(Colors.green(`Compile ${compiler.name}:`), `${moduleName} <= ${fileName}`);

            const result = compiler.execute(fileName, context, output);

            if (!result) {
                console.log(Colors.red(`Failded to compile ${fileName}`));
            }

            compiled = true;
        }
    });

    if (!compiled) {
        if (fileName.search(Copy.test) > 0) {
            const result = Copy.execute(fileName, context, output);

            if (result) {
                console.log(Colors.green('Copy:'), `${moduleName} <= ${fileName}`);
            }
        } else {
            console.error(Colors.red(`Faild to compile ${fileName}: No matching compiler!`));
            return false;
        }
    }

    return true;
};

const compiler = function({ moduleName, entryFile, context, output, compilerList = [], extensions }) {

    context = Path.resolve(context);
    entryFile = Path.resolve(entryFile);

    const compilerConfig = {
        moduleName: moduleName,
        context: context,
        output: output,
        compilers: compilerList.map(compiler => {
            if (typeof compiler === 'string') {
                return require(compilers[compiler]);
            } else {
                return compiler;
            }
        }),
    };

    const sourceFiles = analyze(entryFile, context, extensions);
    const packageFiles = Glob.sync(`${context}/**/package.json`);

    packageFiles.forEach((path) => {
        Copy.execute(path, context, output);

        console.log(Colors.green('Include Package:'), path);
    });

    sourceFiles.forEach(fileName => compileFile(fileName, compilerConfig));
};

module.exports = compiler;
