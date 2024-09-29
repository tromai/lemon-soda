import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";
import { MyClient } from "../../client";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume playing music"),
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

        if (queue.node.isPlaying()) {
            return interaction.reply({
                content: "The bot is playing already.",
            });
        }

        const resume = queue.node.setPaused(false);
        const client = interaction.client as MyClient;
        client.isUserPaused = false;

        return interaction.reply({
            content: resume ? "resume" : "something went wrong",
        });
    },
};
