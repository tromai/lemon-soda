import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";
import { MyClient } from "../../client";

const autoplayonCommand = new SlashCommandBuilder()
    .setName("autoplayoff")
    .setDescription("Disable autoplay");

module.exports = {
    data: autoplayonCommand,
    async execute(interaction: CommandInteraction) {
        const guildId = interaction.commandGuildId;
        if (!guildId) {
            return interaction.reply("Error: Cannot find target channel.");
        }

        const client = interaction.client as MyClient;

        if (client.autoplayStates[guildId] === undefined) {
            client.autoplayStates[guildId] = false;
        } else if (!client.autoplayStates[guildId]) {
            return interaction.reply("Autoplay is already OFF!");
        } else {
            client.autoplayStates[guildId] = false;
        }

        return interaction.reply("Autoplay has been turned OFF!.");
    },
};
