import { Client, ClientOptions, Collection } from "discord.js";
import { SlashCommandExport } from "../commands/type";
import { EventExport } from "../events/type";

export class MyClient extends Client<true> {
    public commands: Collection<string, SlashCommandExport>;
    constructor(
        options: ClientOptions,
        commands: Collection<string, SlashCommandExport>,
        events: Collection<string, EventExport>,
    ) {
        super(options);
        this.commands = commands;

        // Registering events.
        for (const event of events.values()) {
            if (event.once) {
                this.once(event.name.toString(), (...args) =>
                    event.execute(...args),
                );
            } else {
                this.on(event.name.toString(), (...args) =>
                    event.execute(...args),
                );
            }
        }
    }
}
