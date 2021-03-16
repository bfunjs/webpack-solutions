const name = 'px2rem';

export function px2rem(rule, { [name]: options, postcss }) {
    if (!options || typeof options !== 'object') return false;
    let postcssOptions = { plugins: [] };
    let defaultOptions = Object.assign({
        rootValue: 100,
        propList: [ '*' ],
        minPixelValue: 1.5,
    }, options);

    postcssOptions.plugins.push(
        require('postcss-pxtorem')(defaultOptions),
    );
    if (typeof postcss === 'object') {
        postcssOptions = Object.assign(postcssOptions, postcss);
    }
    rule.use('postcss-loader').loader('postcss-loader').options(postcssOptions)
}