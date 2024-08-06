import { SlashCommandBuilder } from "discord.js";
import { CommandInteraction, GuildMember } from "discord.js";

const userCommand = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user.");

module.exports = {
    data: userCommand,
    async execute(interaction: CommandInteraction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user
        // in the specific guild
        if (!(interaction.member instanceof GuildMember)) {
            console.error(
                `<${userCommand.name}>: Member is not of type GuildMember. Ignore.`,
            );
            return;
        }

        const joinDate = interaction.member.joinedAt;
        if (!joinDate) {
            console.error(
                `<${userCommand.name}>: Join date for 'user' slash command is not of type GuildMember. Ignore.`,
            );
            return;
        }

        await interaction.reply(
            `This command was run by ${interaction.user.username}, ` +
                `who joined on ${joinDate.toISOString()}.`,
        );
    },
};
