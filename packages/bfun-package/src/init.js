const { join, resolve } = require('path');
const fs = require('fs-extra');
const rollupCommonjs = require('rollup-plugin-commonjs');
const rollupResolve = require('rollup-plugin-node-resolve');
const rollupJson = require('@rollup/plugin-json');

const { logger } = global.common;

function findAllPackages() {
    const { rootDir, pkgDir = 'packages' } = global;
    const baseDir = join(rootDir, pkgDir);
    return fs.readdirSync(baseDir).filter(file => {
        if (!fs.statSync(`${baseDir}/${file}`).isDirectory()) return false;
        if (!fs.existsSync(`${baseDir}/${file}/package.json`)) return false;
        try {
            const pkg = require(`${baseDir}/${file}/package.json`);
            return !pkg.private;
        } catch (e) {
            return false;
        }
    });
}

export function createConfig(dirName) {
    const { rootDir, pkgDir = 'packages' } = global;
    const targetDir = join(rootDir, pkgDir, dirName);
    const pkgJson = require(join(targetDir, 'package.json'));

    return {
        input: resolve(targetDir, 'src/index.js'),
        output: {
            file: resolve(targetDir, pkgJson.dist || 'dist/index.js'),
            format: 'cjs',
        },
        plugins: [
            rollupJson({ namedExports: false }),
            rollupResolve(),
            rollupCommonjs({
                exclude: 'node_modules/**',
            }),
        ],
        treeshake: {
            moduleSideEffects: false,
        },
    };
}

export async function init(ctx, next, solutionOptions) {
    const { args, solution } = ctx;
    solution.rollup = [];

    await next();

    const target = args[1] || '';
    let list = findAllPackages();
    if (target) list = list.filter(v => target && v === target);

    if (!list.length) {
        logger.error(`未找到符合条件的目录: ${target}`.red);
        process.exit(0);
    }

    solution.rollup = list.map(createConfig);
}
