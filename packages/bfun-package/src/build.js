const { rollup } = require('rollup');

export async function build(ctx) {
    const { solution } = ctx;

    for (const options of solution.rollup) {
        const bundle = await rollup(options);
        await bundle.generate(options.output);
        await bundle.write(options.output);
    }
}
