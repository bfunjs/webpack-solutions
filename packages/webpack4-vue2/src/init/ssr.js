import { initCommonConfig } from './vue';

const { autoDetectJsEntry } = require('@bfun/cli');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const nodeExternals = require('webpack-node-externals');

export function initClientConfig(chain, options) {
    const { client = {} } = options;
    const { entry = 'entry-client.js', filename = 'ssr-client.json' } = client || {};
    const clientEntry = autoDetectJsEntry(entry);
    Object.keys(clientEntry).map(key => chain.entry(key).add(clientEntry[key]));

    initCommonConfig(chain, options);
    chain.plugin('ssr-client').use(VueSSRClientPlugin, [ { filename } ])
    // chain.plugins.delete('clean');
}

export function initServerConfig(chain, options) {
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
