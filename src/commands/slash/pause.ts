import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";
import { MyClient } from "../../client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current track"),
    async execute(interaction: CommandInteraction) {
        let queue;
        try {
            queue = await getQueueFromCommandInteraction(interaction);
        } catch (error) {
            if (error instanceof QueueError) {
                return interaction.reply({ content: error.message });
            } else {
                console.error("Unexpected error:", error);
                return interaction.reply({
                    content: "An unexpected error occurred.",
                });
            }
        }

        if (!queue.node.isPlaying()) {
            return interaction.reply({
                content: "The bot is not currently playing!",
            });
        }

        const paused = queue.node.setPaused(true);
        const client = interaction.client as MyClient;
        client.isUserPaused = true;

        return interaction.reply({
            content: paused ? "paused" : "something went wrong",
        });
    },
};
