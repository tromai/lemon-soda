import { useMainPlayer } from "discord-player";
import {
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from "discord.js";
import { CommandInteraction } from "discord.js";

const queueCommand = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the next songs in the queue")
    .addStringOption((option) =>
        option
            .setName("number")
            .setDescription("The number of next songs to display (Default: 5)")
            .setRequired(false),
    );

module.exports = {
    data: queueCommand,
    async execute(interaction: CommandInteraction) {
        const player = useMainPlayer();

        const guildId = interaction.commandGuildId;
        if (!guildId) {
            return interaction.reply({
                content: "Error: Cannot find target channel.",
            });
        }

        let number = 5;
        const number_option = (
            interaction.options as CommandInteractionOptionResolver
        ).getString("number", false);
        if (number_option) {
            number = parseInt(number_option, 10);

            // Check if the result is a valid integer > 0
            if (isNaN(number) || number <= 0) {
                return interaction.reply(
                    "Error: The number of songs to display" +
                        "must be an integer > 0.",
                );
            }
        }

        const queue = player.queues.get(guildId);
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: "There is nothing playing" });
        }

        // The current Track will have pos -1, while the upcoming tracks will
        // starts from 0 -> +inf.
        // Old tracks will have pos index < 0.
        const songs = queue.tracks
            .map((track, i) => `${i}. ${track.title} - ${track.author}`)
            .join("\n");
        return interaction.reply(`Current queue:\n${songs}`);
    },
};
