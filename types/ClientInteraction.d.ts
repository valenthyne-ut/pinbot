import { CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export type ClientInteraction = {
	data: SlashCommandBuilder | ContextMenuCommandBuilder;
	execute(interaction: CommandInteraction): Promise<void>;
}