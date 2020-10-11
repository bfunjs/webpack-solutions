import { createRollupConfig } from './rollup';
import { createWebpackConfig } from './webpack';

export async function init(ctx, next) {
    const { opts, solution } = ctx;

    let type;
    switch (opts.type) {
        case 'vue':
        case 'react':
        case 'function': {
            type = opts.type;
            break;
        }
        case 'event': {
            type = 'function';
            break;
        }
        default: {
            if (opts.vue) type = 'vue';
            else if (opts.react) type = 'react';
            else type = 'function';
        }
    }
    solution.type = type;
    solution.rollup = [];

    await next();

    if (type === 'function') {
        solution.skip.push('@bfun/solution-webpack4-standard:*');
        const addRollupConfig = config => solution.rollup.push(config);
        await createRollupConfig(addRollupConfig);
    } else {
        solution.skip.push('@bfun/solution-component:build');
        await createWebpackConfig(ctx);
    }
}
