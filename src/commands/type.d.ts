import { SlashCommandBuilder } from "discord.js";

export type SlashCommandExport = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => void;
};
