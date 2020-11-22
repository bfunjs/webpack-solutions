const { VueLoaderPlugin } = require('vue-loader');

const name = 'vue';

export function initCommonConfig(chain, options) {
    const { vue, style, less } = options;

    let defaultOptions = {
        loaders: {
            css: [ 'vue-style-loader' ],
        },
        preserveWhitespace: false,
        transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href',
        },
    };
    if (typeof vue === 'object') defaultOptions = Object.assign(defaultOptions, vue);
    if (style) defaultOptions.loaders.css.push('css-loader');
    if (less) defaultOptions.loaders.less = [ 'vue-style-loader', 'less-loader' ];

    chain.resolve.extensions.add('.vue');
    chain.output.publicPath('/');

    const rule = chain.module.rule(name).test(/\.vue$/);
    rule.use(name).loader('vue-loader').options(defaultOptions);
    chain.plugin('vue-loader').use(VueLoaderPlugin);
}
