import fs from 'fs-extra';

export function isPackageDir(dirName) {
    if (!fs.existsSync(dirName)) return false;
    if (!fs.statSync(dirName).isDirectory()) return false;
    if (!fs.existsSync(`${dirName}/package.json`)) return false;
    try {
        const pkg = require(`${dirName}/package.json`);
        return !pkg.private;
    } catch (e) {
        return false;
    }
}

export function keyGen(key) {
    return `__${key}__`;
}

export function toCamel(name) {
    if (!name) throw new Error();
    let tmp = name.replace(/([^\da-z0-9])/ig, '_');
    if (tmp.startsWith('_')) tmp = tmp.slice(1);
    return tmp.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
        return $1 + $2.toUpperCase();
    });
}
