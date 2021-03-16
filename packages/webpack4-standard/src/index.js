import { init } from './init';

export const required = [ 'webpack' ];
export const version = '__VERSION__';

export * from './init';

export const preDev = init;
export { dev } from './dev';

export const preBuild = init;
export { build } from './build';
