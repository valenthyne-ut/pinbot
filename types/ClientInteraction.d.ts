import { ContextMenuCommandBuilder, Interaction, SlashCommandBuilder } from "discord.js";

export type ClientInteraction = {
	data: SlashCommandBuilder | ContextMenuCommandBuilder;
	execute(interaction: Interaction): Promise<void>;
}