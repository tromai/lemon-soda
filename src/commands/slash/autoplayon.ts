import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { MyClient } from "../../client";

const autoplayonCommand = new SlashCommandBuilder()
    .setName("autoplayon")
    .setDescription("Enable autoplay");

module.exports = {
    data: autoplayonCommand,
    async execute(interaction: CommandInteraction) {
        const guildId = interaction.commandGuildId;
        if (!guildId) {
            return interaction.reply("Error: Cannot find target channel.");
        }

        const client = interaction.client as MyClient;

        if (client.autoplayStates[guildId] === undefined) {
            client.autoplayStates[guildId] = true;
        } else if (client.autoplayStates[guildId]) {
            return interaction.reply(
                "Autoplay is already ON! If you want to reset it," +
                    " turn if off first and run autoplayon again.",
            );
        } else {
            client.autoplayStates[guildId] = true;
        }

        return interaction.reply("Autoplay has been turned ON!.");
    },
};
