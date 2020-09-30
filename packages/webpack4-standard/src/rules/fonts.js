const name = 'fonts';

export default async function (chain, { [name]: options }) {
    let defaultOptions = {
        fallback: 'file-loader',
        limit: 8192,
        name: 'fonts/[name].[ext]',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = chain.module.rule(name).test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/);
    rule.use('url-loader').loader('url-loader').options(defaultOptions);
}