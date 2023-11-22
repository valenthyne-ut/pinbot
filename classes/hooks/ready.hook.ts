import { Client } from "discord.js";
import { logger } from "shared-lib/classes/Logger";
import { sequelize } from "../db";

export const readyHook = async (client: Client) => {
	logger.success(client.user?.tag, "ready.");
	await sequelize.sync();
};