import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";

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

        const paused = queue.node.setPaused(true);
        return interaction.reply({
            content: paused ? "paused" : "something went wrong",
        });
    },
};
