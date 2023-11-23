import { GatewayIntentBits } from "discord.js";
import { ClientInstanceConfig } from "shared-lib/types/ClientInstanceConfig";
import { messageCreateHook } from "./classes/hooks/messageCreate.hook";
import { interactionCreateHook } from "./classes/hooks/interactionCreate.hook";
import { readyHook } from "./classes/hooks/ready.hook";
import { ExtendedClient } from "./classes/ExtendedClient";
import { dirname, join } from "path";

export const init = (config: ClientInstanceConfig) => {
	const interactionsFolderPath = join(dirname(__filename), "interactions");
	const client = new ExtendedClient({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages
		]
	}, interactionsFolderPath);

	client.login(config.token);
	
	client.on("ready", readyHook);
	client.on("messageCreate", messageCreateHook);
	client.on("interactionCreate", interactionCreateHook);
};