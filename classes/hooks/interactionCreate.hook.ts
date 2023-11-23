import { Interaction } from "discord.js";
import { ExtendedClient } from "../ExtendedClient";
import { logger } from "shared-lib/classes/Logger";

export const interactionCreateHook = async (interaction: Interaction) => {
	if(interaction.user.bot) return;
	const client = interaction.client as ExtendedClient;

	if(interaction.isCommand()) {
		const clientInteraction = client.getInteraction(interaction.commandName);
		if(clientInteraction == undefined) {
			logger.error("Missed interaction named", interaction.commandName);
		} else {
			clientInteraction.execute(interaction);
		}
	}
};