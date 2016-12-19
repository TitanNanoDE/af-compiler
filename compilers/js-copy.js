const Path = require('path');
const mkdirp = require('mkdirp');
const Fs = require('fs');

module.exports = {
    copy: true,
    test: /\.(js|css|html|json)$/,
    execute: function(file, context, output) {
        output = Path.resolve(output, Path.relative(context, file));

        mkdirp.sync(Path.dirname(output));

        Fs.createReadStream(file).pipe(Fs.createWriteStream(output));

        return true;
    }
};
