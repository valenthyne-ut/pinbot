import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

export const data = new SlashCommandBuilder()
	.setName("view-pinned-messages")
	.setDescription("Display the server's pinned messages.");

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const paginatedEmbed = new EmbedBuilder()
		.setTitle("Pinned messages")
		.setTimestamp(new Date())
		.setAuthor({name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL()})
		.setFooter({text: "1"});

	const paginationButtonGroup = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("previous")
				.setLabel("⬅")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId("next")
				.setLabel("➡")
				.setStyle(ButtonStyle.Secondary)
		);

	await interaction.reply({
		embeds: [paginatedEmbed],
		components: [paginationButtonGroup]
	}).then(async response => {

		const filter = (i: MessageComponentInteraction) => {
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};

		let rejected = false;

		while(!rejected) {
			await response.awaitMessageComponent({filter: filter, time: 60000})
				.then(async confirmation => {
					const page = parseInt((await response.fetch()).embeds[0].footer!.text);
					const pins = await Pin.findAll({where: {
						channel_id: interaction.channelId
					}});
					
					switch(confirmation.customId) {
					case "previous":
						if(page > 1) { 
							(await response.fetch()).edit({
								embeds: [paginatedEmbed.setFooter({text: (page - 1).toString()})]
							}); 
						}
						break;
		
					case "next":
						if(page < Math.floor(pins.length / 10) + 1) {
							(await response.fetch()).edit({
								embeds: [paginatedEmbed.setFooter({text: (page + 1).toString()})]
							});
						}
						break;
					}
				}).catch(() => {
					rejected = true;
				});
		}
		
	});
};