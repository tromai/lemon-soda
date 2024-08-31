import { useMainPlayer } from "discord-player";
import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";

const skipCommand = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track");

module.exports = {
    data: skipCommand,
    async execute(interaction: CommandInteraction) {
        const player = useMainPlayer();

        const guildId = interaction.commandGuildId;
        if (!guildId) {
            return interaction.reply({
                content: "Error: Cannot find target channel.",
            });
        }

        const queue = player.queues.get(guildId);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: "There is nothing playing" });
        }

        queue.node.skip();
        return interaction.reply(`Skipped ${queue.currentTrack?.cleanTitle}`);
    },
};
