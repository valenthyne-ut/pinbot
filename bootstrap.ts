import { GatewayIntentBits } from "discord.js";
import { messageCreateHook } from "./classes/hooks/messageCreate.hook";
import { interactionCreateHook } from "./classes/hooks/interactionCreate.hook";
import { readyHook } from "./classes/hooks/ready.hook";
import { ExtendedClient } from "./classes/ExtendedClient";
import { dirname, join } from "path";
import { PinbotInstanceConfig } from "./types/PinbotInstanceConfig";

export const init = async (config: PinbotInstanceConfig) => {
	const interactionsFolderPath = join(dirname(__filename), "interactions");
	const client = new ExtendedClient({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages
		]
	}, config, interactionsFolderPath);

	await client.login(config.token);

	client.on("ready", readyHook);
	client.on("messageCreate", messageCreateHook);
	client.on("interactionCreate", interactionCreateHook);
};