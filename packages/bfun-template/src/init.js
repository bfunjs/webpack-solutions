export async function init(ctx, next) {
    await next();
    if (solution.skip.indexOf('__NAME__:init:next') >= 0) return;
}
