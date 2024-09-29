import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";

const skipCommand = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track");

module.exports = {
    data: skipCommand,
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

        queue.node.skip();
        return interaction.reply(`Skipped ${queue.currentTrack?.cleanTitle}`);
    },
};
