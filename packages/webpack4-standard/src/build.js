const { logger } = require('@bfun/cli');
const chalk = require('chalk');
const webpackBuilder = require('webpack');

function buildCallback(err, stats) {
    if (err) {
        logger.error(`\n${err.message}`.red);
        process.exit(1);
    }

    stats.stats.forEach(stat => {
        stat.compilation.children = stat.compilation.children.filter(child => !child.name);
    });

    logger.info(stats.toString({
        colors: true,
        hash: false,
        modules: false,
        timings: false,
    }));
}

export async function build(ctx, next) {
    await next();

    const { webpack, skip } = ctx.solution || {};
    if (skip.indexOf('__NAME__:dev:next') >= 0) return;

    const compiler = webpackBuilder(webpack);
    await new Promise((resolve) => {
        compiler.run(async (err, stats) => {
            buildCallback(err, stats);
            if (stats.hasErrors()) process.exit(1);

            logger.line().green('build completed successfully!'.bold);
            resolve();
        });
    });
}
