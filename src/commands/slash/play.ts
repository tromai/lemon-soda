import { useMainPlayer } from "discord-player";
import {
    CommandInteractionOptionResolver,
    GuildMember,
    SlashCommandBuilder,
} from "discord.js";
import { CommandInteraction } from "discord.js";

const playCommand = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from URL")
    .addStringOption((option) =>
        option
            .setName("query")
            .setDescription(
                "(Required) The url or name of the song you want to play. " +
                    "Spotify and Youtube supported.",
            )
            .setRequired(true),
    );

module.exports = {
    data: playCommand,
    async execute(interaction: CommandInteraction) {
        const player = useMainPlayer();
        const member = interaction.member;

        if (!member || !(member instanceof GuildMember)) {
            await interaction.reply("Could not determine your voice channel.");
            return;
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply("You need to join a voice channel first!");
            return;
        }

        const query = (
            interaction.options as CommandInteractionOptionResolver
        ).getString("query", true);

        // let's defer the interaction as things can take time to process
        await interaction.deferReply();

        const result = await player.search(query, {
            requestedBy: interaction.user,
        });

        if (!result.hasTracks()) {
            return interaction.followUp("Not found");
        }

        try {
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node
                    // (aka your queue in simple word)
                    // we can access this metadata object using queue.metadata later on
                    metadata: interaction,
                },
            });

            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
    },
};
