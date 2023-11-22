import { Client, GatewayIntentBits } from "discord.js";
import { ClientInstanceConfig } from "shared-lib/types/ClientInstanceConfig";
import { messageCreateHook } from "./classes/hooks/messageCreate.hook";
import { interactionCreateHook } from "./classes/hooks/interactionCreate.hook";
import { readyHook } from "./classes/hooks/ready.hook";

export const init = (config: ClientInstanceConfig) => {
	const client = new Client({intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages
	]});

	client.login(config.token);
	
	client.on("ready", readyHook);
	client.on("messageCreate", messageCreateHook);
	client.on("interactionCreate", interactionCreateHook);
};