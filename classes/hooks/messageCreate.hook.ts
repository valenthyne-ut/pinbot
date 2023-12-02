import { Message, MessageType } from "discord.js";
import { Pin } from "../db/models/Pin.model";

export const messageCreateHook = async (message: Message) => {
	if(message.type === MessageType.ChannelPinnedMessage) {
		if(message.guildId == null) return;

		const pinnedMessage = await message.fetchReference();
		if(!pinnedMessage) return;

		await pinnedMessage.unpin();
		message.delete();

		const isPinned = await Pin.findOne({
			where: {
				channel_id: pinnedMessage.channelId,
				message_id: pinnedMessage.id
			}
		});

		if(isPinned) {
			await message.channel.send({
				content: `<@${message.author.id}>, [the message you tried to pin](${isPinned.getMessageLink()}) is already pinned.`
			});
		} else {
			await Pin.createMessagePin(pinnedMessage)
				.then(async (pin) => {
					await message.channel.send({
						content: `<@${message.author.id}> pinned [a message](${pin.getMessageLink()}) to this channel.`
					});
				})
				.catch(async () => {
					await message.channel.send({
						content: `<@${message.author.id}>, couldn't pin the message. Please try again.`
					});
				});
		}
	}
};