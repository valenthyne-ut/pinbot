import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "./dist/clients/root/pinbot/pinbot.db",
	logging: false
});