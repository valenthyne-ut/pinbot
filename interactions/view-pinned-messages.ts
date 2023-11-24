import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("view-pinned-messages")
	.setDescription("Display the server's pinned messages.");

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.reply("wip");
};