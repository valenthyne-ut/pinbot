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
		const pinnedMessageGuildId = pinnedMessage.guildId!; // already assured we were in a guild above
		const pinnedMessageChannelId = pinnedMessage.channelId;
		const pinnedMessageId = pinnedMessage.id;
		const dateTimeSent = new Date(pinnedMessage.createdTimestamp);

		await Pin.create({
			author: messageAuthor,
			guild_id: pinnedMessageGuildId,
			channel_id: pinnedMessageChannelId,
			message_id: pinnedMessageId,
			datetime_sent: dateTimeSent
		}).then(async () => {
			await pinnedMessage.reply({
				content: `<@${message.author.id}> pinned a message to this channel. **See all pinned messages**.`
			});
		}).catch(async () => {
			await message.channel.send({
				content: `<@${message.author.id}>, I couldn't pin the message, please try again.`,
			});
		});
	}
};