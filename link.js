const Webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const Colors = require('colors');
const Path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const link = function(webpackConfig) {
    let progressVisibile = false;

    webpackConfig.module = webpackConfig.module || {};

    webpackConfig.module.rules = [{
        test: /\.(js|css)$/,
        enforce: 'pre',
        use: 'source-map-loader'
    }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
            loader: 'css-loader?sourceMaps,-url',
            fallbackLoader: 'style-loader',
        })
    }];

    webpackConfig.plugins = [
        new ExtractTextPlugin('[name].css'),
    ];

    let linker = Webpack(webpackConfig);

    linker.apply(new ProgressPlugin(function(percentage, msg) {
        const pLength = 40;
        let progress = new Array(Math.round(percentage * pLength) + 1);
        let pOffset = new Array(pLength - Math.round(percentage * pLength) + 1);

        if (progressVisibile) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
        }

        process.stdout.write(Colors.green('Link Webpack: ') +
            `${Object.keys(webpackConfig.entry)[0]} ${Math.round(percentage * 100)}% [${progress.join('=')}>${pOffset.join(' ')}] ${msg}`);
        progressVisibile = true;
    }));

    return new Promise((success) => {
        linker.run((errors, stats) => {
            errors || console.error(Colors.red(errors));

            stats.compilation.errors.forEach((error) => console.error(Colors.green('Webpack:'), Colors.red(error.message)));
            stats.compilation.warnings.forEach(warning => console.warn(Colors.green('Webpack:'), Colors.red(warning.message)));

            Object.keys(stats.compilation.assets).forEach(asset =>
                console.log(Colors.cyan(`Install Webpack: ${Path.resolve(webpackConfig.output.path, asset)}`))
            );

            success();
        });
    });
};

module.exports = link;
