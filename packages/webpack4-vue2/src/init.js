const path = require('path');
const { createWebpackConfig } = require('@bfun/solution-webpack4-standard');
const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const { autoDetectJsEntry } = global.common;
const name = 'vue';

function initCommonConfig(chain, options) {
    const { vue, style, less } = options;

    let defaultOptions = {
        loaders: {
            css: [ 'vue-style-loader' ],
        },
        preserveWhitespace: false,
        transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href',
        },
    };
    if (typeof vue === 'object') defaultOptions = Object.assign(defaultOptions, vue);
    if (style) defaultOptions.loaders.css.push('css-loader');
    if (less) defaultOptions.loaders.less = [ 'vue-style-loader', 'less-loader' ];

    chain.resolve.extensions.add('.vue');
    chain.output.publicPath('/');

    const rule = chain.module.rule(name).test(/\.vue$/);
    rule.use(name).loader('vue-loader').options(defaultOptions);
    chain.plugin('vue-loader').use(VueLoaderPlugin);
}

function initClientConfig(chain, options) {
    const { client = {} } = options;
    const { entry = 'entry-client.js', filename = 'ssr-client.json' } = client || {};
    const clientEntry = autoDetectJsEntry(entry);
    Object.keys(clientEntry).map(key => chain.entry(key).add(clientEntry[key]));

    initCommonConfig(chain, options);
    chain.plugin('ssr-client').use(VueSSRClientPlugin, [ { filename } ])
    // chain.plugins.delete('clean');
}


function initServerConfig(chain, options) {
    const { server = {} } = options;
    const { entry = 'entry-server.js', filename = 'ssr-server.json' } = server || {};
    const serverEntry = autoDetectJsEntry(entry);
    Object.keys(serverEntry).map(key => chain.entry(key).add(serverEntry[key]));

    initCommonConfig(chain, options);

    chain.plugin('ssr-server').use(VueSSRServerPlugin, [ { filename } ])
    chain.target('node');
    chain.output.filename('server-bundle.js');
    chain.output.libraryTarget('commonjs2');
    chain.externals(nodeExternals({ whitelist: /\.css$/ }));

    chain.plugins.delete('template');
    chain.plugins.delete('clean');
}

export async function init(ctx, next, solutionOptions) {
    const { webpack, options = {} } = ctx.solution || {};
    const { ssr = false } = solutionOptions;
    if (ssr && webpack.length < 2) webpack.push(await createWebpackConfig(options, [ 'template' ]))

    const [ clientConfig, serverConfig ] = webpack;
    if (ssr) {
        initClientConfig(clientConfig, options);
        initServerConfig(serverConfig, options);
        ctx.solution.skip.push('@bfun/solution-webpack4-standard:dev');
    } else {
        initCommonConfig(clientConfig, options);
    }

    await next();
}
