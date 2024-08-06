import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction } from "discord.js";

const userCommand = new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server.");

module.exports = {
    data: userCommand,
    async execute(interaction: CommandInteraction) {
        // interaction.guild is the object representing the Guild in which the command
        // was run.
        if (!interaction.guild) {
            console.error(
                `<${userCommand.name}>:  for 'user' slash command is not of type GuildMember. Ignore.`,
            );
            return;
        }
        await interaction.reply(
            `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
        );
    },
};
