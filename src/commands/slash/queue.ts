import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteractionOptionResolver,
    ComponentType,
    SlashCommandBuilder,
} from "discord.js";
import { createPagesEmbeds } from "../../message_utils.ts";
import { CommandInteraction } from "discord.js";
import { getQueueFromCommandInteraction, QueueError } from "../../player";

const queueCommand = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the next songs in the queue")
    .addStringOption((option) =>
        option
            .setName("number")
            .setDescription(
                "The number of songs to display at a time (Default: 5)",
            )
            .setRequired(false),
    );

module.exports = {
    data: queueCommand,
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

        let number = 5;
        const number_option = (
            interaction.options as CommandInteractionOptionResolver
        ).getString("number", false);
        if (number_option) {
            number = parseInt(number_option, 10);

            // Check if the result is a valid integer > 0
            if (isNaN(number) || number <= 0 || number > 100) {
                return interaction.reply(
                    "Error: The number of upcoming tracks to display " +
                        `must be an integer, > 0.`,
                );
            }
        }

        // The current Track will have pos -1, while the upcoming tracks will
        // starts from 0 -> +inf.
        // Old tracks will have pos index < 0.
        const songs = queue.tracks.map(
            (track, i) => `${i + 1}. ${track.title} - ${track.author}\n`,
        );
        const embeds = createPagesEmbeds(songs, number);

        let currentPage = 0;
        // Send the initial message
        const sentMessage = await interaction.reply({
            embeds: [embeds[currentPage]],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("◀️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("▶️")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(embeds.length <= 1),
                ),
            ],
            fetchReply: true, // Needed to get the message ID for editing later
        });

        // Create an interaction collector to handle button clicks
        const collector = sentMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000, // Collector will last for 1 minute
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({
                    content: "You are not authorized to use these buttons.",
                    ephemeral: true,
                });
            }

            if (buttonInteraction.customId === "next") {
                if (currentPage < embeds.length - 1) {
                    currentPage++;
                }
            } else if (buttonInteraction.customId === "prev") {
                if (currentPage > 0) {
                    currentPage--;
                }
            }

            await buttonInteraction.update({
                embeds: [embeds[currentPage]],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("◀️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("▶️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === embeds.length - 1),
                    ),
                ],
            });
        });

        collector.on("end", () => {
            // Optionally disable buttons after the collector ends
            sentMessage.edit({
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("◀️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("▶️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                    ),
                ],
            });
        });
    },
};
