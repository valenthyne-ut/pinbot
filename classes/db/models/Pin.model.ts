import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "..";

export class Pin extends Model<InferAttributes<Pin>, InferCreationAttributes<Pin>> {
	declare public readonly id: number | null;
	declare public readonly author: string;
	declare public readonly guild_id: string;
	declare public readonly channel_id: string;
	declare public readonly message_id: string;
	declare public readonly datetime_sent: Date;
}

Pin.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	author: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	guild_id: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	channel_id: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	message_id: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	datetime_sent: {
		type: DataTypes.DATE,
		allowNull: false
	},
}, { sequelize });