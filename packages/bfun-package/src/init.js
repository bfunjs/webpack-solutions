import { join, resolve } from 'path';
import fs from 'fs-extra';
import { isPackageDir, keyGen, toCamel } from '../../shared';

const rollupAlias = require('@rollup/plugin-alias');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const rollupJson = require('@rollup/plugin-json');
const rollupReplace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript2');

const { logger } = global.common;

function findAllPackages(target) {
    const { rootDir } = global;
    const baseDir = join(rootDir, target);

    if (isPackageDir(baseDir)) return [ baseDir ];
    return fs.readdirSync(baseDir).map(name => join(baseDir, name))
        .filter(name => isPackageDir(name));
}

function createReplacePlugin(constants) {
    const replacements = {};
    Object.keys(constants).forEach(key => {
        if (key in process.env) {
            replacements[key] = process.env[key];
        } else {
            replacements[key] = constants[key];
        }
    });
    return rollupReplace(replacements)
}

export function createConfig(target, addRollupConfig) {
    const { rootDir } = global;
    const pkgJson = require(join(target, 'package.json'));
    const { name: pkgName, version, buildOptions = {} } = pkgJson;
    const defaultEntry = fs.existsSync(resolve(target, 'src/index.ts')) ? 'src/index.ts' : 'src/index.js';
    const hasTSConfig = fs.existsSync(resolve(target, 'tsconfig.json'));
    const {
        entry = defaultEntry, dist = [ {} ], alias,
        sourcemap = false, externalLiveBindings = false,
        env: globalEnv = {}, minified: globalMinified = false,
        globals = {},
    } = buildOptions;
    let hasTSChecked = false;

    fs.removeSync(`${target}/dist`);
    return dist.map(options => {
        const { name = '', output = 'dist/index.js', format = 'cjs', minified = globalMinified, env = {} } = options;
        const isNodeBuild = format === 'cjs';
        const shouldEmitDeclarations = pkgJson.types && !hasTSChecked;
        const tsPlugin = rollupTypescript({
            check: process.env.NODE_ENV === 'production' && !hasTSChecked,
            tsconfig: resolve(hasTSConfig ? target : rootDir, 'tsconfig.json'),
            cacheRoot: resolve(rootDir, 'node_modules/.rts2_cache'),
            tsconfigOverride: {
                compilerOptions: {
                    sourceMap: sourcemap,
                    declaration: shouldEmitDeclarations,
                    declarationMap: shouldEmitDeclarations,
                },
                exclude: [ '**/__tests__', 'test-dts' ],
            },
        });
        hasTSChecked = true;

        const external = [ 'path', 'url', 'fs-extra', ...Object.keys(globals) ];
        const config = {
            input: resolve(target, entry),
            output: {
                name: toCamel(name || pkgName),
                file: resolve(target, output),
                format,
                sourcemap,
                externalLiveBindings,
                globals,
            },
            external,
            plugins: [
                rollupJson({ namedExports: false }),
                // @bfun/solution-* 不设默认tsconfig.json，强制要求tsconfig.json
                entry.endsWith('.ts') ? tsPlugin : undefined,
                createReplacePlugin({
                    [keyGen('NAME')]: pkgName,
                    [keyGen('VERSION')]: version,
                    [keyGen('NODE_JS')]: isNodeBuild,
                    ...(Object.assign(globalEnv, env)),
                }),
                nodeResolve(),
                rollupCommonjs({
                    exclude: [ 'node_modules/**', 'bfun_modules/**' ],
                }),
                minified ? terser({
                    module: /^esm/.test(format),
                    compress: {
                        ecma: 2015,
                        pure_getters: true,
                    },
                }) : undefined,
                alias ? rollupAlias({ entries: alias }) : undefined,
            ].filter(v => v),
            // treeshake: {
            //     moduleSideEffects: false,
            // },
        };

        addRollupConfig({
            target,
            pkgJson,
            options,
            config,
        });
    })
}

export async function init(ctx, next, solutionOptions) {
    const { args, solution } = ctx;
    solution.rollup = [];

    await next();
    if (solution.skip.indexOf('__NAME__:init:next') >= 0) return;

    const target = args[1] || 'packages';
    let list = findAllPackages(target);

    if (!list.length) {
        logger.error(`未找到符合条件的目录: ${target}`.red);
        process.exit(0);
    }

    const addRollupConfig = config => solution.rollup.push(config);
    list.map(target => createConfig(target, addRollupConfig));
}
