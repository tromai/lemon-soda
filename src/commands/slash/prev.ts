import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";

const skipCommand = new SlashCommandBuilder()
    .setName("prev")
    .setDescription("Go back to the previous track");

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

        const lastSong = queue.history.previousTrack;
        if (!lastSong) {
            return interaction.reply("There is no previous track!");
        }

        await queue.history.previous();
        return interaction.reply({
            content: `Playing previous song, [${lastSong.title}](${lastSong.url})`,
        });
    },
};
