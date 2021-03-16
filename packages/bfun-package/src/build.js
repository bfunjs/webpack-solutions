import { resolve } from 'path';
import { init } from './init';

const { logger } = require('@bfun/cli');
const fs = require('fs-extra');
const { rollup: rollupBuild, watch: watchBuild } = require('rollup');

export const preBuild = init;

export async function build(ctx) {
    const { solution, args } = ctx;
    const { watch } = args;
    const apiAnalysisMap = {};

    for (const item of solution.rollup) {
        const start = Date.now();
        const { target, apiExtractorConfigPath, config, pkgJson } = item;
        const bundle = watch ? await watchBuild(config) : await rollupBuild(config);
        await bundle.generate(config.output);
        await bundle.write(config.output);

        if (pkgJson.types && !apiAnalysisMap[target]) {
            apiAnalysisMap[target] = true;
            logger.line();

            const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
            const extractorConfigPath = resolve(apiExtractorConfigPath || target, 'api-extractor.json');
            const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
            const extractorResult = Extractor.invoke(extractorConfig, {
                localBuild: true,
                showVerboseMessages: true,
            });

            if (extractorResult.succeeded) {
                // concat additional d.ts to rolled-up dts
                const typesDir = resolve(target, 'types');
                if (await fs.exists(typesDir)) {
                    const dtsPath = resolve(target, pkgJson.types);
                    const existing = await fs.readFile(dtsPath, 'utf-8');
                    const typeFiles = await fs.readdir(typesDir);
                    const toAdd = await Promise.all(
                        typeFiles.map(file => {
                            return fs.readFile(resolve(typesDir, file), 'utf-8')
                        }),
                    );
                    await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'))
                }
                logger.green('API Extractor completed successfully.'.bold);
            } else {
                logger.error(
                    `API Extractor completed with ${extractorResult.errorCount} errors`,
                    `and ${extractorResult.warningCount} warnings`,
                );
                process.exitCode = 1
            }

            await fs.remove(`${target}/dist/packages`);
            if (apiExtractorConfigPath) {
                await fs.remove(`${target}/dist/src`);
                await fs.remove(`${target}/temp`);
            }
        }

        logger.line()
            .green(`${config.input} -> ${config.output.file}`.cyan.bold)
            .green(`created ${config.output.file} in ${Date.now() - start}ms`.bold);
    }

    logger.line().green('build completed successfully!'.bold);
}
