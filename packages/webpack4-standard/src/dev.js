const { logger } = require('@bfun/cli');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const chokidar = require('chokidar');

async function setupDevServer({ host, port, wConfig, devServer }) {
    const devServerEntry = [
        `webpack-dev-server/client?http://${host}:${port}`,
        'webpack/hot/dev-server',
    ];
    wConfig.forEach(item => {
        Object.keys(item.entry).forEach(name => {
            item.entry[name] = devServerEntry.concat(item.entry[name]);
        });
        item.plugins.push(new webpack.HotModuleReplacementPlugin());
    });

    const [ clientConfig = {} ] = wConfig || [];
    const compiler = webpack(clientConfig);
    compiler.apply(new FriendlyErrorsWebpackPlugin({
        clearConsole: true,
    }));

    let hasCompile = false;
    compiler.plugin('done', stats => {
        if (stats.hasErrors()) {
            logger.error(stats.toString({ colors: true }));
            logger.info('\n----------- 构建失败 ----------'.rainbow);
        } else if (!hasCompile) {
            hasCompile = true;
        } else {
            logger.info('\n----------- 构建完成 ----------'.rainbow);
        }
    });

    const { output = {}, devServer: clientDevServer = {} } = clientConfig;
    const devServerOption = {
        publicPath: output.publicPath || '/',
        hot: true,
        compress: true,
        disableHostCheck: true,
        quiet: true,
        overlay: true,
        clientLogLevel: 'warning', // "none" | "info" | "warning" | "error"
        ...clientDevServer,
        ...devServer,
    };
    const server = new WebpackDevServer(compiler, devServerOption);
    server.listen(port, '0.0.0.0');
}

export async function dev(ctx, next) {
    const { host, port, solution, filepath } = ctx;
    const { webpack: wConfig, options } = solution || {};
    const { devServer = {} } = options;

    await next();
    if (solution.skip.indexOf('__NAME__:dev:next') >= 0) return;

    await setupDevServer({ host, port, wConfig, devServer });

    if (filepath) chokidar.watch(filepath).on('change', () => process.send('restart'));
}
