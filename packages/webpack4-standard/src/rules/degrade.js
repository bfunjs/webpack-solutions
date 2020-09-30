const fs = require('fs');
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const name = 'degrade'

export default async function (chain, { [name]: options }) {
    const defaultTmplDir = global.configDir || process.cwd();
    const filename = (typeof options === 'string') ? options : 'degrade.html';
    let defaultOptions = {
        filename: 'degrade.html',
        template: join(defaultTmplDir, filename),
        inject: false,
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
    if (!fs.existsSync(defaultOptions.template)) return;

    chain.plugin(name).use(HtmlWebpackPlugin, [ defaultOptions ]);
}