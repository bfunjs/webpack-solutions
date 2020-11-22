import { toCamel } from '../../../shared';
import { generateWebpackConfig } from '../../../webpack4-standard/src';
import { initCommonConfig } from '../../../webpack4-vue3/src/init/vue';

const { resolve, join } = require('path');
const { ProgressPlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let hasCleaned = false;

export async function createWebpackConfig(ctx) {
    const { rootDir } = global;
    const { solution } = ctx;
    const { options = {} } = solution || {};
    const { clean } = options || {};
    const pkgJson = require(join(rootDir, 'package.json'));
    const { name, buildOptions = {} } = pkgJson;
    const { minified = true, sourceMap } = buildOptions;
    const extra = { sourceMap, minified, filters: [ 'template' ] };
    const chain = await generateWebpackConfig(options, extra);
    chain.externals({ 'vue': 'Vue' });

    if (hasCleaned === false) {
        let defaultOptions = Object.assign({
            verbose: false,
            dry: false,
        }, typeof clean === 'object' ? clean : {});
        chain.plugin('clean').use(CleanWebpackPlugin, [ defaultOptions ]);
        hasCleaned = true;
    }

    if (solution.type === 'vue') {
        await initCommonConfig(chain, {});
    }

    // 清空 @bfun/solution-webpack4-standard 配置，并且不再调用 await next();
    solution.webpack = [ chain ];

    const list = [];
    for (let i = 0, l = solution.webpack.length; i < l; i++) {
        const wChain = solution.webpack[i];
        const config = await wChain.toConfig();
        config.entry = {
            index: process.env.NODE_ENV === 'production'
                ? resolve(rootDir, 'src/index.js')
                : resolve(rootDir, 'start.js'),
        };
        const { output = {} } = config;
        output.library = toCamel(name);
        output.libraryTarget = 'umd';
        list.push(config);
    }
    if (list.length < 1) console.warn('webpack config not found');
    solution.webpack = list;
}
