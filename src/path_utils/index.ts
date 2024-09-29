import fs from "node:fs";
import pathlib from "node:path";

/**
 * Return True if ``content`` ends with any of the suffix in ``suffixes`` else False.
 */
export function hasSuffix(content: string, suffixes: string[]): boolean {
    return suffixes.some((suff) => content.endsWith(suff));
}

/**
 * Return the names of elements within a directory that matche any of the suffix in
 * ``extentions``. These elements can be links, directories or files.
 */
export function getPathsWithExt(
    dir: string,
    extensions: string[],
): Array<string> {
    const result = [];
    const dirElements = fs.readdirSync(dir);

    for (const ele of dirElements) {
        if (!hasSuffix(ele, extensions)) {
            continue;
        }
        result.push(pathlib.join(dir, ele));
    }
    return result;
}
