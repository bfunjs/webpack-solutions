import { build as rollupBuild } from '../../bfun-package/src/build';

export async function build(ctx) {
    const { solution } = ctx;

    if (solution.type === 'function') {
        await rollupBuild(ctx);
    }
}
