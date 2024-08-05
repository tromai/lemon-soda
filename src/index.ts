import fs from "node:fs";
import pathlib from "node:path";
import {
    Client,
    ClientOptions,
    Collection,
    Events,
    GatewayIntentBits,
    SlashCommandBuilder,
} from "discord.js";
import { token } from "../data/config.json";
import type { SlashCommandExport } from "./commands/type";
class MyClient extends Client {
    public commands: Collection<string, SlashCommandExport>;
    constructor(
        options: ClientOptions,
        commands: Collection<string, SlashCommandExport>,
    ) {
        super(options);
        this.commands = commands;
    }
}

function hasSuffix(content: string, suffixes: string[]): boolean {
    return suffixes.some((suff) => content.endsWith(suff));
}

/**
 * This method doesn't check if a path is a file or directory.
 */
function getPathsWithExt(dir: string, extensions: string[]): Array<string> {
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

function loadSlashCommands(
    dir: string = pathlib.join(__dirname, "commands/utility"),
): Collection<string, SlashCommandExport> {
    const result = new Collection<string, SlashCommandExport>();
    const paths = getPathsWithExt(dir, [".ts"]);

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

const client = new MyClient(
    { intents: [GatewayIntentBits.Guilds] },
    loadSlashCommands(),
);

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as MyClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`,
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

client.login(token).catch(() => {});
