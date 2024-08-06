import fs from "node:fs";
import pathlib from "node:path";

function hasSuffix(content: string, suffixes: string[]): boolean {
    return suffixes.some((suff) => content.endsWith(suff));
}

/**
 * This method doesn't check if a path is a file or directory.
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
