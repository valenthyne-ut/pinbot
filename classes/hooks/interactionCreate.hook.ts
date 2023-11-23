import { Interaction } from "discord.js";
import { ExtendedClient } from "../ExtendedClient";

export const interactionCreateHook = async (interaction: Interaction) => {
	const clientInteractions = (interaction.client as ExtendedClient).getInteractions();
};