const Path = require('path');
const mkdirp = require('mkdirp');
const Fs = require('fs');

module.exports = {
    copy: true,
    test: /\.(js|css|html|json)$/,
    execute: function(file, context, output) {
        const relativePath = Path.relative(context, file);

        // simply skip modules which are out of context
        if (/^\.\.\//.test(relativePath)) {
            return false;
        }

        const target = Path.resolve(output, relativePath);

        mkdirp.sync(Path.dirname(target));

        Fs.createReadStream(file).pipe(Fs.createWriteStream(target));

        return true;
    }
};
