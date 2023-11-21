import { Client, GatewayIntentBits } from "discord.js";
import { logger } from "shared-lib/classes/Logger";
import { ClientInstanceConfig } from "shared-lib/types/ClientInstanceConfig";

export const init = (config: ClientInstanceConfig) => {
	const client = new Client({intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages
	]});
	
	client.login(config.token);
	client.on("ready", async () => {
		logger.success(client.user?.tag, "ready.");
	});
};