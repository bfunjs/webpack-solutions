const { resolve } = require('path');

const name = 'babel';

export default async function (chain, { [name]: options }) {
    let defaultOptions = { presets: [ '@babel/preset-env' ] };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = chain.module.rule(name).test(/\.js$/);
    rule.exclude.add(resolve(process.cwd(), 'node_modules'));
    rule.use('babel-loader')
        .loader('babel-loader')
        .options(defaultOptions);
}