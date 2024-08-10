import { Interaction, CacheType, Events } from "discord.js";
import { MyClient } from "../../client/client";

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const myclient = interaction.client as MyClient;
        const command = myclient.commands.get(interaction.commandName);

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
    },
};
