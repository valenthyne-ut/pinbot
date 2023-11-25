import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

const pagesPerList = 5;

const getPinPagesCount = async (guildId: string, channelId: string): Promise<number> => {
	const pinTotal = await Pin.count({
		where: {
			guild_id: guildId,
			channel_id: channelId
		}
	});
	return Math.floor(pinTotal / pagesPerList) + 1;
};

const getPaginatedEmbedList = async (guildId: string, channelId: string, page: number): Promise<Array<EmbedBuilder>> => {
	const pins = (await Pin.findAll({
		where: {
			guild_id: guildId,
			channel_id: channelId
		},
		limit: pagesPerList,
		offset: (page - 1) * pagesPerList
	})).map(pin => pin.toJSON());

	const pinEmbeds: Array<EmbedBuilder> = [];
	pins.forEach((pin, index) => {
		const pinEmbed = new EmbedBuilder()
			.setTitle("Jump to message")
			.setURL(`https://discord.com/channels/${pin.guild_id}/${pin.channel_id}/${pin.message_id}`)
			.setAuthor({name: pin.author, iconURL: pin.author_avatar_url})
			.setTimestamp(pin.datetime_sent)
			.setColor("#2B2D31");
		if(index == 4 || pins.length - 1 == index) { pinEmbed.setFooter({text: page.toString()}); }

		pinEmbeds.push(pinEmbed);
	});

	return pinEmbeds;
};

export const data = new SlashCommandBuilder()
	.setName("view-pinned-messages")
	.setDescription("Display the server's pinned messages.")
	.addIntegerOption(option => 
		option
			.setName("page")
			.setDescription("The page to get (each page contains 10 pins).")
			.setRequired(false));

export const execute = async (interaction: ChatInputCommandInteraction) => {
	
	const interactionGuildId = interaction.guildId;
	if(interactionGuildId == null) return;

	const interactionChannelId = interaction.channelId;

	let pinPagesCount = await getPinPagesCount(interactionGuildId, interactionChannelId);

	let page = 1;
	const userPage = interaction.options.getInteger("page", false);

	if(userPage != null && (userPage > 0 && userPage < pinPagesCount)) {
		page = userPage;
	}

	const pinEmbeds = await getPaginatedEmbedList(interactionGuildId, interactionChannelId, page);
	const paginationButtonGroup = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("previous")
				.setLabel("<-")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("next")
				.setLabel("->")
				.setStyle(ButtonStyle.Primary)
		);

	await interaction.reply({
		embeds: pinEmbeds,
		components: [paginationButtonGroup]
	}).then(async response => {
		const filter = (filterInteraction: MessageComponentInteraction) => {
			filterInteraction.deferUpdate();
			return filterInteraction.user.id === interaction.user.id;
		};

		let rejected = false;

		while(!rejected) {
			await response.awaitMessageComponent({filter: filter, time: 60000})
				.then(async confirmation => {
					
					const responseMessage = await response.fetch();
					const embedPage = parseInt(responseMessage.embeds.pop()!.footer!.text);
					pinPagesCount = await getPinPagesCount(interactionGuildId, interactionChannelId);

					switch(confirmation.customId) {
					case "previous":
						if(embedPage > 1) {
							responseMessage.edit({
								embeds: await getPaginatedEmbedList(interactionGuildId, interactionChannelId, embedPage - 1)
							});
						}
						break;

					case "next":
						if(embedPage < pinPagesCount) {
							responseMessage.edit({
								embeds: await getPaginatedEmbedList(interactionGuildId, interactionChannelId, embedPage + 1)
							});
						}
						break;
					}

				})
				.catch(() => {
					rejected = true;
				});
		}
	});
};