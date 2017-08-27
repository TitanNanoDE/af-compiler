const Webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const Colors = require('colors');
const Path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const link = function(webpackConfig) {
    let progressVisibile = false;
    const { paralelLinking } = webpackConfig;

    delete webpackConfig.paralelLinking;
    webpackConfig.module = webpackConfig.module || {};

    webpackConfig.module.rules = [{
        test: /\.(js|css)$/,
        enforce: 'pre',
        use: 'source-map-loader'
    }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            use: 'css-loader?sourceMaps,-url',
            fallback: 'style-loader',
        })
    }, {
        test: /\.json$/,
        use: 'json-loader',
    }];

    webpackConfig.plugins = [
        new ExtractTextPlugin('[name].css'),
    ];

    const linker = Webpack(webpackConfig);
    let lastLinkerOut = '';

    linker.apply(new ProgressPlugin(function(percentage, msg, modules, active, name) {
        if (progressVisibile) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
        }

        name = name && name.split('!').pop() || msg;

        if (name === 'building modules') {
            return;
        }

        if (name === lastLinkerOut) {
            return;
        }

        const state = Colors.green('Link Webpack: ') +
            `[${Math.round(percentage * 100)}%] ${Object.keys(webpackConfig.entry)[0]} <= ${name}`;

        if (name) {
            lastLinkerOut = name;

            if (!paralelLinking) {
                progressVisibile = true;
                process.stdout.write(state);
            } else {
                console.log(state);
            }
        }
    }));

    return new Promise((success, failure) => {
        linker.run((errors, stats) => {
            errors && console.error(Colors.red(errors));

            stats.compilation.warnings.forEach(warning => console.warn(Colors.green('Webpack:'), Colors.yellow(warning.message)));

            if (stats.compilation.errors.length > 0) {
                stats.compilation.errors.forEach((error) => console.error(Colors.green('Webpack:'), Colors.red(error.message)));
                failure();
            }

            Object.keys(stats.compilation.assets).forEach(asset =>
                console.log(Colors.cyan(`Install Webpack: ${Path.resolve(webpackConfig.output.path, asset)}`))
            );

            success();
        });
    });
};

module.exports = link;
