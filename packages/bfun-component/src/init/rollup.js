import { keyGen, toCamel } from '../../../shared';

const { join, resolve } = require('path');
const fs = require('fs-extra');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const rollupJson = require('@rollup/plugin-json');
const rollupReplace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript2');

const dist = [
    {
        output: 'dist/index.js',
        format: 'umd',
    },
    {
        output: 'dist/esm.dev.js',
        format: 'esm',
        minified: false,
    },
    {
        output: 'dist/esm.min.js',
        format: 'esm',
        minified: true,
    },
];

function createReplacePlugin(constants) {
    const replacements = {};
    Object.keys(constants).forEach(key => {
        const finalKey = keyGen(key.toUpperCase());
        if (finalKey in process.env) {
            replacements[finalKey] = process.env[finalKey];
        } else {
            replacements[finalKey] = constants[key];
        }
    });
    return rollupReplace(replacements)
}

export async function createRollupConfig(addRollupConfig) {
    const { rootDir } = global;
    const tsconfig = 'tsconfig.json';
    const pkgJson = require(join(rootDir, 'package.json'));
    const { name, version, buildOptions = {} } = pkgJson;
    const defaultEntry = fs.existsSync(resolve(rootDir, 'src/index.ts')) ? 'src/index.ts' : 'src/index.js';
    const hasTSConfig = fs.existsSync(resolve(rootDir, tsconfig));
    const isProductionEnv = process.env.NODE_ENV === 'production';
    const {
        entry = defaultEntry, globals = {},
        sourcemap = false, externalLiveBindings = false,
        constant = {}, minified: globalMinified = isProductionEnv,
    } = buildOptions;
    let hasTSChecked = false;

    fs.removeSync(`${rootDir}/dist`);
    return dist.map(options => {
        const { output, format, minified = globalMinified } = options;
        const shouldEmitDeclarations = pkgJson.types && !hasTSChecked;
        const tsPlugin = rollupTypescript({
            check: isProductionEnv && !hasTSChecked,
            tsconfig: hasTSConfig ? resolve(rootDir, tsconfig) : resolve(__dirname, '../', tsconfig),
            cacheRoot: resolve(rootDir, 'node_modules/.rts2_cache'),
            tsconfigOverride: {
                compilerOptions: {
                    baseUrl: rootDir,
                    rootDir: rootDir,
                    sourceMap: sourcemap,
                    declaration: shouldEmitDeclarations,
                    declarationMap: shouldEmitDeclarations,
                },
                include: [ `${rootDir}/src/*` ],
            },
        });
        hasTSChecked = true;

        const external = [ 'path', 'url', ...Object.keys(globals) ];
        const config = {
            input: resolve(rootDir, entry),
            output: {
                name: toCamel(name),
                file: resolve(rootDir, output),
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
                createReplacePlugin({ version, ...constant }),
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
            ].filter(v => v),
            treeshake: {
                moduleSideEffects: false,
            },
        };

        addRollupConfig({
            target: rootDir,
            apiExtractorConfigPath: resolve(__dirname, '../'),
            pkgJson,
            options,
            config,
        });
    })
}
