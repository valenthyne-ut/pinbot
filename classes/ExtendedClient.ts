/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, ClientOptions } from "discord.js";
import { ClientInteraction } from "../types/ClientInteraction";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { logger } from "shared-lib/classes/Logger";
import { PinbotInstanceConfig } from "../types/PinbotInstanceConfig";

export class ExtendedClient extends Client {
	private interactionMap: Map<string, ClientInteraction> = new Map();
	private interactionsFolderPath: string;
	private config: PinbotInstanceConfig;

	constructor(options: ClientOptions, config: PinbotInstanceConfig, interactionsFolderPath: string) {
		super(options);
		if(!existsSync(interactionsFolderPath)) {
			throw new Error("Interactions folder path doesn't exist.");
		} else {
			this.interactionsFolderPath = interactionsFolderPath;
		}
		this.config = config;
		this.loadInteractions();
	}

	private loadInteractions() {
		const interactionFilenames = readdirSync(this.interactionsFolderPath);
		interactionFilenames.forEach(interactionFilename => {
			const interactionFilepath = join(this.interactionsFolderPath, interactionFilename);
			const interaction: ClientInteraction = require(interactionFilepath);

			if(!("data" in interaction && "execute" in interaction)) {
				logger.warning("Invalid interaction hook at", interactionFilepath);
			} else {
				const interactionName = interaction.data.name;
				this.interactionMap.set(interactionName, interaction);
			}
		});
	}

	getInteractions(): Array<ClientInteraction> {
		return Array.from(this.interactionMap.values());
	}

	getInteraction(name: string): ClientInteraction | undefined {
		return this.interactionMap.get(name);
	}

	getDeployInteractionsStatus(): boolean {
		return this.config.deployInteractions;
	}
}