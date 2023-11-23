import { Client } from "discord.js";
import { logger } from "shared-lib/classes/Logger";
import { sequelize } from "../db";
import { ExtendedClient } from "../ExtendedClient";
import { InteractionDeployer } from "../InteractionDeployer";

export const readyHook = async (client: Client) => {
	const extendedClient = client as ExtendedClient;

	logger.success(extendedClient.user?.tag, "ready.");
	await sequelize.sync();

	if(extendedClient.getDeployInteractionsStatus()) {
		new InteractionDeployer(extendedClient).deployInteractions();
	}
};