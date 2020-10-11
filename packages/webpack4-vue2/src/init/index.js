import { initCommonConfig } from './vue';
import { initClientConfig, initServerConfig } from './ssr';

const { generateWebpackConfig } = require('@bfun/solution-webpack4-standard');

export async function init(ctx, next, solutionOptions) {
    const { webpack, options = {} } = ctx.solution || {};
    const { ssr = false } = solutionOptions;
    if (ssr && webpack.length < 2) webpack.push(await generateWebpackConfig(options, { filters: [ 'template' ] }))

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
