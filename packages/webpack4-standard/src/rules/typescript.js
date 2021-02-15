const name = 'typescript';

export default async function (chain, { [name]: options }) {
    chain.resolve.extensions.add('.ts').add('.tsx');
    const rule = chain.module.rule(name).test(/\.tsx?$/);
    rule.use('ts-loader').loader('ts-loader');
    if (typeof options === 'object') rule.options(options);
}
