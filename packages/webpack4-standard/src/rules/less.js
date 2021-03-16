import { px2rem } from './px2rem';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const name = 'less'

export default async function (chain, allOptions) {
    const rule = chain.module.rule(name).test(/\.less$/);
    rule.use('MiniCssExtractPlugin')
        .loader(MiniCssExtractPlugin.loader)
        .options({
            hmr: process.env.NODE_ENV !== 'production',
        });
    rule.use('css-loader').loader('css-loader');
    px2rem(rule, allOptions);
    rule.use('less-loader').loader('less-loader').options({ javascriptEnabled: true });
}