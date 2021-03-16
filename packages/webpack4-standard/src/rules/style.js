import { px2rem } from './px2rem';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const name = 'style'

export default async function (chain, allOptions) {
    const { [name]: options, hash } = allOptions;
    let defaultOptions = { filename: hash ? `[name].[hash:${ hash }].css` : 'css/[name].css' };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = chain.module.rule(name).test(/\.css$/);
    rule.use('MiniCssExtractPlugin')
        .loader(MiniCssExtractPlugin.loader)
        .options({
            hmr: process.env.NODE_ENV !== 'production',
        });
    rule.use('css-loader').loader('css-loader');

    px2rem(rule, allOptions);
    chain.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [ defaultOptions ]);
}
