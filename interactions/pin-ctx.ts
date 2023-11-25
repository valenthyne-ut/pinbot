import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

export const data = new ContextMenuCommandBuilder()
	.setName("Pin")
	.setType(ApplicationCommandType.Message);

export const execute = async (interaction: MessageContextMenuCommandInteraction) => {
	if(interaction.guildId == null) return;

	const pinnedMessage = interaction.targetMessage;

	const messageAuthor = pinnedMessage.author.username;
	const messageAuthorAvatarURL = pinnedMessage.author.avatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png";
	const pinnedMessageGuildId = pinnedMessage.guildId!;
	const pinnedMessageChannelId = pinnedMessage.channelId;
	const pinnedMessageId = pinnedMessage.id;
	const dateTimeSent = new Date(pinnedMessage.createdTimestamp);

	let messageContent = "";
	if(pinnedMessage.content.length > 0) {
		messageContent = pinnedMessage.content.substring(0, 50) + "...";
	} else if(pinnedMessage.attachments.size > 0) {
		messageContent = `${pinnedMessage.attachments.size} attachment(s).`;
	} else if(pinnedMessage.embeds.length > 0) {
		messageContent = `${pinnedMessage.embeds.length} embed(s).`;
	}

	const messageLink = `https://discord.com/channels/${pinnedMessageGuildId}/${pinnedMessageChannelId}/${pinnedMessageId}`;
	const isPinned = await Pin.findOne({where: {message_id: pinnedMessageId}});

	if(isPinned) {
		await interaction.reply({
			content: "Message is already pinned.",
			ephemeral: true
		});
	} else {
		await Pin.create({
			author: messageAuthor,
			author_avatar_url: messageAuthorAvatarURL,
			message_content: messageContent,
			guild_id: pinnedMessageGuildId,
			channel_id: pinnedMessageChannelId,
			message_id: pinnedMessageId,
			datetime_sent: dateTimeSent
		}).then(async () => {
			await interaction.reply({
				content: `<@${interaction.user.id}> pinned [a message](${messageLink}) to this channel. See all pinned messages.`
			}).catch(async () => {
				await interaction.reply({
					content: "I couldn't pin the message, please try again.",
					ephemeral: true
				});
			});
		});
	}
};