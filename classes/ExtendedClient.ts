/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, ClientOptions } from "discord.js";
import { ClientInteraction } from "../types/ClientInteraction";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { logger } from "shared-lib/classes/Logger";

export class ExtendedClient extends Client {
	private interactionMap: Map<string, ClientInteraction> = new Map();
	private interactionsFolderPath: string;

	constructor(options: ClientOptions, interactionsFolderPath: string) {
		super(options);
		if(!existsSync(interactionsFolderPath)) {
			throw new Error("Interactions folder path doesn't exist.");
		} else {
			this.interactionsFolderPath = interactionsFolderPath;
		}

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

	getInteractions() {
		return Array.from(this.interactionMap.values());
	}
}