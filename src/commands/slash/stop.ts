import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { QueueError } from "../../player";
import { useMainPlayer } from "discord-player";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop and remove the bot"),
    async execute(interaction: CommandInteraction) {
        const player = useMainPlayer();

        const guildId = interaction.commandGuildId;
        if (!guildId) {
            throw new QueueError("Error: Cannot find target channel.");
        }

        const queue = player.queues.get(guildId);
        if (!queue || !queue.isPlaying()) {
            throw new QueueError("There is nothing playing");
        }

        const stop = player.nodes.delete(guildId);
        return interaction.reply({
            content: stop ? "stop" : "something went wrong",
        });
    },
};
