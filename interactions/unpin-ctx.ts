import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

export const data = new ContextMenuCommandBuilder()
	.setName("Unpin")
	.setType(ApplicationCommandType.Message);

export const execute = async (interaction: MessageContextMenuCommandInteraction) => {
	if(interaction.guildId == null) return;

	const pinnedMessage = interaction.targetMessage;
	const pinnedMessageId = pinnedMessage.id;
	const isPinned = await Pin.findOne({where: {message_id: pinnedMessageId}});

	if(!isPinned) {
		await interaction.reply({
			content: "Message is not pinned.",
			ephemeral: true
		});
	} else {
		await Pin.destroy({where: {message_id: pinnedMessageId}}).then(async () => {
			await interaction.reply({
				content: "Message has been unpinned.",
				ephemeral: true
			});
		}).catch(async () => {
			await interaction.reply({
				content: "I couldn't unpin the message, please try again.",
				ephemeral: true
			});
		});
	}
};