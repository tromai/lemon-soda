import { Track, useMainPlayer } from "discord-player";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteractionOptionResolver,
    ComponentType,
    GuildMember,
    SlashCommandBuilder,
} from "discord.js";
import { CommandInteraction } from "discord.js";
import { MyClient } from "../../client";
import { createPagesEmbeds } from "../../message_utils.ts";

const playCommand = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Add anything you want to play to the queue")
    .addStringOption((option) =>
        option
            .setName("query")
            .setDescription(
                "Your query goes here, URL or name, Youtube and Spotify supported.",
            )
            .setRequired(true),
    );

/**
 * Returns the default play options.
 */
function getDefaultPlayOptions(interaction: CommandInteraction) {
    return {
        nodeOptions: {
            // nodeOptions are the options for guild node
            // (aka your queue in simple word)
            // we can access this metadata object using queue.metadata later on
            metadata: interaction,
            // Automatically leaves the voice channel if empty
            leaveOnEmpty: true,
            // Wait 30 seconds before leaving after the channel is empty
            leaveOnEmptyCooldown: 30000,
            // Do not leave when the queue ends
            leaveOnEnd: false,
            // Leave when the bot is stopped
            leaveOnStop: false,
        },
    };
}

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
            return interaction.followUp(
                "Cannot find any suitable song. Please try a different one!",
            );
        }

        const client = interaction.client as MyClient;
        // We clear the autoplay list so that it will be updated with songs
        // relevant to the latest added song.
        client.clearAutoPlayList(voiceChannel.guildId);

        if (result.tracks.length > 1) {
            // We only display at most first 5 songs of the search results for the user
            // to select.
            // Any more than that wouldn't be as relevant to the original query.
            const mostRelevantTracks = result.tracks.slice(0, 5);
            const songsDesc = mostRelevantTracks.map(
                (track, i) => `${i + 1}. ${track.title} - ${track.author}\n`,
            );

            const embed = createPagesEmbeds("Search results", songsDesc, 5)[0];
            const buttonsComponent = new ActionRowBuilder<ButtonBuilder>();
            const buttons = mostRelevantTracks.map((_, i) =>
                new ButtonBuilder()
                    .setCustomId(`${i + 1}`)
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Primary),
            );
            buttonsComponent.addComponents(buttons);

            const availableTracksMessage = await interaction.followUp({
                embeds: [embed],
                components: [buttonsComponent],
                fetchReply: true,
            });

            const collector =
                availableTracksMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 20000, // Collector will last for 20 seconds
                });

            let isUserSelected = false;
            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return buttonInteraction.reply({
                        content: "You are not authorized to use these buttons.",
                        ephemeral: true,
                    });
                }

                const selectedTrackIndex =
                    parseInt(buttonInteraction.customId, 10) - 1;

                // Disable all buttons after the song has been selected.
                buttonsComponent.components.map((component) =>
                    component.setDisabled(true),
                );
                await buttonInteraction.update({
                    components: [buttonsComponent],
                });

                try {
                    const { track } = await player.play(
                        voiceChannel,
                        result.tracks[selectedTrackIndex],
                        getDefaultPlayOptions(interaction),
                    );
                    return interaction.followUp(`**${track.title}** enqueued!`);
                } catch (e) {
                    // let's return error if something failed
                    console.log(e);
                    return interaction.followUp("Something went wrong");
                }
            });

            collector.once("collect", () => {
                isUserSelected = true;
            });

            collector.on("end", () => {
                // Disable all buttons after the selection time out.
                buttonsComponent.components.map((component) =>
                    component.setDisabled(true),
                );
                availableTracksMessage.edit({
                    components: [buttonsComponent],
                });

                if (!isUserSelected) {
                    return interaction.followUp(
                        `No song has been added for "${query}". Please select one.`,
                    );
                }
            });
        } else if (result.tracks.length == 1) {
            // If there is only one result in the search, play that directly.
            try {
                const { track } = await player.play(
                    voiceChannel,
                    result.tracks.pop() as Track<unknown>,
                    getDefaultPlayOptions(interaction),
                );
                return interaction.followUp(`**${track.title}** enqueued!`);
            } catch (e) {
                // let's return error if something failed
                console.log(e);
                return interaction.followUp("Something went wrong");
            }
        } else {
            console.log("Critical: shouldn't reach here");
        }
    },
};
