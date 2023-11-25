import { Message, MessageType } from "discord.js";
import { Pin } from "../db/models/Pin.model";

export const messageCreateHook = async (message: Message) => {
	if(message.type === MessageType.ChannelPinnedMessage) {
		if(message.guildId == null) return;

		const pinnedMessage = await message.fetchReference();
		if(!pinnedMessage) return;

		await pinnedMessage.unpin();
		await message.delete();

		const messageAuthor = pinnedMessage.author.username;
		const messageAuthorAvatarURL = pinnedMessage.author.avatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png";
		const pinnedMessageGuildId = pinnedMessage.guildId!; // already assured we were in a guild above
		const pinnedMessageChannelId = pinnedMessage.channelId;
		const pinnedMessageId = pinnedMessage.id;
		const dateTimeSent = new Date(pinnedMessage.createdTimestamp);

		let messageContent = "";
		if(pinnedMessage.content.length > 0) {
			messageContent = pinnedMessage.content.substring(0, 50);
			if(pinnedMessage.content.length > 50) { messageContent += "..."; }
		} else if(pinnedMessage.attachments.size > 0) {
			messageContent = `${pinnedMessage.attachments.size} attachment(s).`;
		} else if(pinnedMessage.embeds.length > 0) {
			messageContent = `${pinnedMessage.embeds.length} embed(s).`;
		}

		const messageLink = `https://discord.com/channels/${pinnedMessageGuildId}/${pinnedMessageChannelId}/${pinnedMessageId}`;
		const isPinned = await Pin.findOne({
			where: {
				channel_id: pinnedMessageChannelId, 
				message_id: pinnedMessageId
			}
		});

		if(isPinned) {
			await message.channel.send({
				content: `<@${message.author.id}>, [the message you tried to pin](${messageLink}) is already pinned.`
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
				await message.channel.send({
					content: `<@${message.author.id}> pinned [a message](${messageLink}) to this channel. See all pinned messages.`
				});
			}).catch(async () => {
				await message.channel.send({
					content: `<@${message.author.id}>, I couldn't pin the message, please try again.`,
				});
			});
		}
	}
};