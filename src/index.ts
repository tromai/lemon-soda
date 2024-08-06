import { Events, GatewayIntentBits } from "discord.js";
import { token } from "../data/config.json";
import { loadSlashCommands } from "./commands";
import { MyClient } from "./client/client";

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
