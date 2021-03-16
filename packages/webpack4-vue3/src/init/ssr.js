import { initCommonConfig } from './vue';

const { autoDetectJsEntry } = require('@bfun/cli');
const nodeExternals = require('webpack-node-externals');

export function initClientConfig(chain, options) {
    const { client = {} } = options;
    const { entry = 'entry-client.js', filename = 'ssr-client.json' } = client || {};
    const clientEntry = autoDetectJsEntry(entry);
    Object.keys(clientEntry).map(key => chain.entry(key).add(clientEntry[key]));

    initCommonConfig(chain, options);
    // chain.plugin('ssr-client').use(VueSSRClientPlugin, [ { filename } ])
}

export function initServerConfig(chain, options) {
    const { server = {} } = options;
    const { entry = 'entry-server.js', filename = 'ssr-server.json' } = server || {};
    const serverEntry = autoDetectJsEntry(entry);
    Object.keys(serverEntry).map(key => chain.entry(key).add(serverEntry[key]));

    initCommonConfig(chain, options);

    // chain.plugin('ssr-server').use(VueSSRServerPlugin, [ { filename } ])
    chain.target('node');
    chain.output.filename('server-bundle.js');
    chain.output.libraryTarget('commonjs2');
    chain.externals(nodeExternals({ whitelist: /\.(css|vue)$/ }));

    chain.plugins.delete('template');
    chain.plugins.delete('clean');
}
