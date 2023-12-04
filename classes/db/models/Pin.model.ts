import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "..";
import { Message } from "discord.js";

export class Pin extends Model<InferAttributes<Pin>, InferCreationAttributes<Pin, {omit: never}>> {
	declare public readonly id: number | null;

	declare public readonly avatar: string;
	declare public readonly display_name: string;
	declare public readonly timestamp_sent: Date;
	declare public readonly content: string;
	declare public readonly content_preview: string | null;

	declare public readonly guild_id: string;
	declare public readonly channel_id: string;
	declare public readonly message_id: string;

	public static createMessagePin = async (message: Message): Promise<Pin> => {
		const messageContent: Array<string> = [];
		let contentPreview: string | null = null;

		if(message.content.length > 0) {
			try {
				new URL(message.content);
				messageContent.push(message.content);
			} catch(error) {
				messageContent.push(message.content.substring(0, 100));
				if(messageContent[0].length > 97) { messageContent[0] += "..."; }
			}
		}

		if(message.attachments.size > 0) {
			const attachmentTypes: Map<string, number> = new Map();
			message.attachments.forEach(attachment => {
				const contentType = (attachment.contentType?.split("/")[0]) || "unknown";
				if(contentPreview == null && contentType == "image") { contentPreview = attachment.url; }
				attachmentTypes.set(contentType, (attachmentTypes.get(contentType) || 0) + 1);
			});
			attachmentTypes.forEach((value, key) => {
				messageContent.push(`${value} ${key} file${value > 1 ? "s": ""}`);
			});
		}

		if(message.embeds.length > 0) {
			const embedCount = message.embeds.length;
			message.embeds.forEach(embed => {
				if(contentPreview == null && embed.thumbnail != null) { contentPreview = embed.thumbnail.url; }
			});
			messageContent.push(`${embedCount} embed${embedCount > 1 ? "s": ""}`);
		}

		return (await Pin.create({
			avatar: message.author.avatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png",
			display_name: message.author.displayName,
			timestamp_sent: new Date(message.createdTimestamp),
			content: messageContent.join("\n"),
			content_preview: contentPreview,

			guild_id: message.guildId!,
			channel_id: message.channelId,
			message_id: message.id
		}));
	};

	public getMessageLink = (): string => {
		return `https://discord.com/channels/${this.guild_id}/${this.channel_id}/${this.message_id}`;
	};
}

Pin.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},

	avatar: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	display_name: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	timestamp_sent: {
		type: DataTypes.DATE,
		allowNull: false
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	content_preview: {
		type: DataTypes.TEXT,
		allowNull: true
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
	}
}, { sequelize });