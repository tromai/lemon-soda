import pathlib from "node:path";
import type { EventExport } from "./type.d.ts";
import { Collection } from "discord.js";
import { getPathsWithExt } from "../path_utils/index.js";

export function loadEventDefinitions(
    dir: string = pathlib.join(__dirname, "./events"),
): Collection<string, EventExport> {
    const result = new Collection<string, EventExport>();
    const paths = getPathsWithExt(dir, [".ts"]);

    for (const path of paths) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const event: EventExport = require(path);
        // Set a new item in the Collection with the key as the even name
        // and the value as the event exported module.
        if ("name" in event && "execute" in event && "once" in event) {
            result.set(event.name, event as EventExport);
        } else {
            console.log(
                `[WARNING] The command at ${path} is missing a required"` +
                    '"data" or "execute" property.',
            );
        }
    }

    return result;
}
