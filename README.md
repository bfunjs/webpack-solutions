# @bfun/cli webpack-solutions

## solutions
```javascript
export const required = [ 'webpack' ]; // when b.config.js framework is 'webpack'
export const extensions = [ '@bfun/solution-webpack4-standard' ]; // extends solutions

export { init } from './init'; // (ctx: { [key: string]: any }, next: () => any) => any
export { dev } from './dev'; // init -> dev
export { build } from './build'; // init -> build
export { deploy } from './deploy'; // init -> deploy

// OR
module.exports = {
    init, dev, build, deploy
};
```

| Project | Version |
| ------- | ------- |
| @bfun/solution-webpack4-standard | [![latest][bs-ws-badge]][bs-ws-npm] |
| @bfun/solution-webpack4-standard-h5 | [![latest][bs-ws5-badge]][bs-ws5-npm] |
| @bfun/solution-webpack4-vue2 | [![latest][bs-wv2-badge]][bs-wv2-npm] |
| @bfun/solution-webpack4-vue3 | [![latest][bs-wv2-badge]][bs-wv3-npm] |

[bs-ws-badge]: https://img.shields.io/npm/v/@bfun/solution-webpack4-standard/latest.svg
[bs-ws-npm]: https://www.npmjs.com/package/@bfun/solution-webpack4-standard/v/latest

[bs-ws5-badge]: https://img.shields.io/npm/v/@bfun/solution-webpack4-standard-h5/latest.svg
[bs-ws5-npm]: https://www.npmjs.com/package/@bfun/solution-webpack4-standard-h5/v/latest

[bs-wv2-badge]: https://img.shields.io/npm/v/@bfun/solution-webpack4-vue2/latest.svg
[bs-wv2-npm]: https://www.npmjs.com/package/@bfun/solution-webpack4-vue2/v/latest

[bs-wv3-badge]: https://img.shields.io/npm/v/@bfun/solution-webpack4-vue3/latest.svg
[bs-wv3-npm]: https://www.npmjs.com/package/@bfun/solution-webpack4-vue3/v/latest