const name = 'assets';

export default async function (chain, { [name]: options, hash }) {
    let defaultOptions = {
        fallback: 'file-loader',
        limit: 8192,
        name: hash ? `assets/[name].[hash:${hash}].[ext]` : 'assets/[name].[ext]',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    chain.module.rule(name)
        .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
        .use('url-loader')
        .loader('url-loader')
        .options(defaultOptions);
}
