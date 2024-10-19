import pathlib from "node:path";
import type { SlashCommandExport } from "./type.d.ts";
import { Collection, SlashCommandBuilder } from "discord.js";
import { getPathsWithExt } from "../path_utils/index.js";

/**
 * Load all slash commands from the ``./slash`` directory.
 * This funciton should be called once for each {@link MyClient} created.
 */
export function loadSlashCommands(
    dir: string = pathlib.join(__dirname, "./slash"),
): Collection<string, SlashCommandExport> {
    const result = new Collection<string, SlashCommandExport>();
    const paths = getPathsWithExt(dir, [".js", ".ts"]);

    for (const path of paths) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const command = require(path);
        // Set a new item in the Collection with the key as the command name
        // and the value as the exported module
        const data: SlashCommandBuilder = command.data;
        if ("data" in command && "execute" in command) {
            result.set(data.name, command as SlashCommandExport);
        } else {
            console.log(
                `[WARNING] The command at ${path} is missing a required"` +
                    '"data" or "execute" property.',
            );
        }
    }

    return result;
}
