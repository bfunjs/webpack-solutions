const { resolve } = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const { FileSystem } = require('@bfun/utils');
const { File, FileType } = FileSystem;

const name = 'eslint';

async function detectEslintConfig() {
    const { rootDir } = global;
    const list = await new File(rootDir).list(FileType.FILE);
    const target = list.find(value => value.startsWith('.eslintrc'));
    if (target) return resolve(rootDir, target);
    return resolve(__dirname, '../.eslintrc.js');
}

export default async function (chain, { [name]: options }) {
    if (options === false) return;

    let defaultOptions = {};
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    chain.plugin('eslint').use(EslintWebpackPlugin, [ defaultOptions ]);
}
