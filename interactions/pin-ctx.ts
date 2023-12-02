import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

export const data = new ContextMenuCommandBuilder()
	.setName("Pin")
	.setType(ApplicationCommandType.Message);

export const execute = async (interaction: MessageContextMenuCommandInteraction) => {
	if(interaction.guildId == null) return;

	const pinnedMessage = interaction.targetMessage;
	if(!pinnedMessage) return;

	await pinnedMessage.unpin();

	const isPinned = await Pin.findOne({
		where: {
			channel_id: pinnedMessage.channelId,
			message_id: pinnedMessage.id
		}
	});

	if(isPinned) {
		await interaction.reply({
			content: `[The message you tried to pin](${isPinned.getMessageLink()}) is already pinned.`
		});
	} else {
		await Pin.createMessagePin(pinnedMessage)
			.then(async (pin) => {
				await interaction.reply({
					content: `<@${interaction.user.id}> pinned [a message](${pin.getMessageLink()}) to this channel.`
				});
			})
			.catch(async () => {
				await interaction.reply({
					content: "Couldn't pin the message. Please try again.",
					ephemeral: true
				});
			});
	}
};