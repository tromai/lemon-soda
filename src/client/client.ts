import { Client, ClientOptions, Collection } from "discord.js";
import { SlashCommandExport } from "../commands/type";

export class MyClient extends Client {
    public commands: Collection<string, SlashCommandExport>;
    constructor(
        options: ClientOptions,
        commands: Collection<string, SlashCommandExport>,
    ) {
        super(options);
        this.commands = commands;
    }
}
