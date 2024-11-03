import { REST, Routes } from "discord.js";
import { loadSlashCommands } from "../src/commands";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const slashCommands = loadSlashCommands();
const slashCommandsJSON = [];
for (const command of slashCommands.values()) {
    slashCommandsJSON.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(
            `Started refreshing ${slashCommandsJSON.length} application (/) commands.`,
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: slashCommandsJSON,
        });

        console.log(
            `Successfully reloaded ${slashCommandsJSON.length} application (/) commands.`,
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
