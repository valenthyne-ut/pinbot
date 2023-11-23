import { logger } from "shared-lib/classes/Logger";
import { ExtendedClient } from "./ExtendedClient";
import { RESTPostAPIApplicationCommandsJSONBody as InteractionsData, REST, Routes } from "discord.js";

export class InteractionDeployer {
	private client: ExtendedClient;

	constructor(client: ExtendedClient) {
		this.client = client;
	}

	deployInteractions() {
		logger.info("Deploying interactions...");

		const interactionsData: Array<InteractionsData> = 
			this.client.getInteractions()
				.map(interaction => interaction.data.toJSON());

		const user = this.client.user!;
		const clientToken = this.client.token!;

		const rest = new REST().setToken(clientToken);
		const guilds = this.client.guilds.cache.map(guild => guild.id);

		guilds.forEach(async (guildId: string) => {
			try {
				await rest.put(Routes.applicationGuildCommands(user.id, guildId), { body: interactionsData });
				logger.success(`Deployed ${interactionsData.length} interactions to guild ${guildId}`);
			} catch(error) {
				let errorMessage = "";

				if(typeof error === "string") {
					errorMessage = error;
				} else if(error instanceof Error) {
					errorMessage = error.stack || error.message;
				}

				logger.error(`Failed to deploy interactions to guild ${guildId}.\n${errorMessage}`);
			}
		});		
	}
}