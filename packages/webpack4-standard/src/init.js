import assets from './rules/assets';
import babel from './rules/babel';
import fonts from './rules/fonts';
import style from './rules/style';
import less from './rules/less';
import template from './rules/template';
import degrade from './rules/degrade';

const { autoDetectJsEntry } = global.common;
const path = require('path');
const WebpackChain = require('webpack-chain');
const { ProgressPlugin } = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const rules = { assets, babel, fonts, style, less, template, degrade };

export async function createWebpackConfig(options, extra = {}) {
    const { filters = [], sourceMap = false } = extra;
    const chain = new WebpackChain();

    if (process.env.NODE_ENV === 'production') {
        chain.stats('errors-only');
        chain.mode('production');
        chain.optimization.minimize(true)
        if (sourceMap) chain.devtool('source-map');
        chain.optimization.minimizer('TerserWebpackPlugin').use(TerserWebpackPlugin, [ { sourceMap } ]);
        chain.optimization.minimizer('OptimizeCssAssets').use(OptimizeCssAssets);
    } else {
        chain.stats('minimal');
        chain.mode('development');
        chain.optimization.minimize(false);
    }

    chain.resolve.extensions.add('.js').add('.json');

    const tmp = Object.keys(rules);
    for (let i = 0, l = tmp.length; i < l; i++) {
        const key = tmp[i];
        if (filters.indexOf(key) > -1) continue;
        await rules[key](chain, options);
    }

    chain.output.path(path.join(process.cwd(), 'dist')).filename('[name].js');
    chain.output.publicPath('/');
    chain.plugin('progress').use(ProgressPlugin);
    return chain;
}

export async function init(ctx, next) {
    const { bConfig, solution } = ctx;
    const { options = {} } = solution || {};
    const { sourceMap, configure } = bConfig;
    const { clean } = options;
    const chain = await createWebpackConfig(options, { sourceMap });

    if (clean !== false) {
        let defaultOptions = Object.assign({
            verbose: false,
            dry: false,
        }, typeof clean === 'object' ? clean : {});
        chain.plugin('clean').use(CleanWebpackPlugin, [ defaultOptions ]);
    }
    // 我们希望当configure是一个对象时只影响第一个webpack配置，防止后面的配置受到污染
    // 如果希望影响每一个webpack配置，可以将configure设置为函数
    if (typeof configure === 'object') chain.merge(configure);

    if (!solution.webpack) solution.webpack = [];
    solution.webpack.push(chain);

    await next();

    const list = [];
    for (let i = 0, l = solution.webpack.length; i < l; i++) {
        const wChain = solution.webpack[i];
        let status = true;
        if (typeof configure === 'function') status = await configure(wChain, i);
        if (status === false) continue;
        const config = await wChain.toConfig();
        config.entry = autoDetectJsEntry(config.entry);
        const { output = {}, externals } = config;
        if (externals && output && output.libraryTarget && output.libraryTarget !== 'umd') {
            if (typeof externals === 'object' && !(externals instanceof Array)) {
                delete config.externals;
            }
        }
        list.push(config);
    }
    if (list.length < 1) console.warn('webpack config not found');
    solution.webpack = list;
}