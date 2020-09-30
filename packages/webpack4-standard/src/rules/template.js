const fs = require('fs');
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const name = 'template'

export default async function (chain, { [name]: options }) {
    const defaultTmplDir = global.configDir || process.cwd();
    const filename = (typeof options === 'string') ? options : 'index.html';
    let defaultOptions = {
        filename: 'index.html',
        template: join(defaultTmplDir, filename),
        inject: true,
        minify: {
            removeComments: false,
            collapseWhitespace: true,
            removeAttributeQutes: true,
        },
        chunksSortMode: 'none',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }
    if (!fs.existsSync(defaultOptions.template)) {
        defaultOptions.inject = false;
        defaultOptions.template = require('html-webpack-template');
    }

    chain.plugin(name).use(HtmlWebpackPlugin, [ defaultOptions ]);
}