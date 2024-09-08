import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear the music queue"),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
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

        queue.tracks.clear();
        return interaction.editReply({
            content: "Queue cleared successfully!",
        });
    },
};
