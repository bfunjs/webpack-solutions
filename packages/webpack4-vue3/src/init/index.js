import { initCommonConfig } from './vue';

const { createWebpackConfig } = require('@bfun/solution-webpack4-standard');

export async function init(ctx, next, solutionOptions) {
    const { webpack, options = {} } = ctx.solution || {};
    const { ssr = false } = solutionOptions;
    if (ssr && webpack.length < 2) webpack.push(await createWebpackConfig(options, [ 'template' ]))

    const [ clientConfig ] = webpack;
    if (ssr) {
        ctx.solution.skip.push('@bfun/solution-webpack4-standard:dev');
    } else {
        initCommonConfig(clientConfig, options);
    }

    await next();
}
