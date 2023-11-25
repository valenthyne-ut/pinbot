import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Pin } from "../classes/db/models/Pin.model";

const pinsPerPage = 5;

const getPinPagesCount = async (guildId: string, channelId: string): Promise<number> => {
	const pinTotal = await Pin.count({
		where: {
			guild_id: guildId,
			channel_id: channelId
		}
	});

	return Math.floor(pinTotal / pinsPerPage) + 1;
};

const getEmbedArrayFromPage = async (guildId: string, channelId: string, pageNumber: number, maxPages: number): Promise<Array<EmbedBuilder>> => {
	const pins = (await Pin.findAll({
		where: {
			guild_id: guildId,
			channel_id: channelId
		},
		limit: pinsPerPage,
		offset: (pageNumber - 1) * pinsPerPage
	})).map(pin => pin.toJSON());

	const pinEmbeds: Array<EmbedBuilder> = [];
	pins.forEach((pin, index) => {
		const pinEmbed = new EmbedBuilder()
			.setTitle("Jump to message")
			.setURL(`https://discord.com/channels/${pin.guild_id}/${pin.channel_id}/${pin.message_id}`)
			.setAuthor({name: pin.author, iconURL: pin.author_avatar_url})
			.setTimestamp(pin.datetime_sent)
			.setColor("#2B2D31");	
		if(index == 4 || pins.length - 1 == index) { pinEmbed.setFooter({text: `${pageNumber} out of ${maxPages} pages`}); }

		pinEmbeds.push(pinEmbed);
	});

	return pinEmbeds;
};

export const data = new SlashCommandBuilder()
	.setName("view-pinned-messages")
	.setDescription("Display this channel's pinned messages")
	.addIntegerOption(option => 
		option
			.setName("page-number")
			.setDescription(`The page of pins to get (each page contains ${pinsPerPage} pins).`)
			.setRequired(false))
	.setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {

	await interaction.deferReply();

	const guildId = interaction.guildId!;
	const channelId = interaction.channelId;

	let pinPages = await getPinPagesCount(guildId, channelId);

	const pageNumberOptionValue = interaction.options.getInteger("page-number", false);
	const pageNumber = (pageNumberOptionValue != null && (pageNumberOptionValue > 0 && pageNumberOptionValue < pinPages)) ?
		pageNumberOptionValue:
		1;

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

	const pinEmbeds = await getEmbedArrayFromPage(guildId, channelId, pageNumber, pinPages);
	if(pinEmbeds.length == 0) {
		await interaction.editReply({
			content: "This channel doesn't have any pinned messages."
		});
	} else {
		await interaction.editReply({
			embeds: await getEmbedArrayFromPage(guildId, channelId, pageNumber, pinPages),
			components: [paginationButtonGroup]
		}).then(async response => {
			const filter = (filterInteraction: MessageComponentInteraction) => {
				filterInteraction.deferUpdate();
				return filterInteraction.user.id === interaction.user.id;
			};

			let rejected = false;

			while(!rejected) {
				const responseMessage = await response.fetch();
				await response.awaitMessageComponent({filter: filter, time: 60000})
					.then(async confirmation => {
						const embedPage = parseInt(responseMessage.embeds.pop()!.footer!.text.split(" ").shift()!);
						pinPages = await getPinPagesCount(guildId, channelId);
						let nextPage = pageNumber;

						switch(confirmation.customId) {
						case "previous":
							if(embedPage > 1) {
								nextPage = embedPage - 1;
							}
							break;

						case "next":
							if(embedPage < pinPages) {
								nextPage = embedPage + 1;
							}
							break;
						}

						await responseMessage.edit({
							embeds: await getEmbedArrayFromPage(guildId, channelId, nextPage, pinPages)
						});
					})
					.catch(async () => {
						await responseMessage.edit({
							components: [
								new ActionRowBuilder<ButtonBuilder>()
									.addComponents(
										new ButtonBuilder()
											.setCustomId("halted")
											.setLabel("🛑")
											.setStyle(ButtonStyle.Secondary)
											.setDisabled(true)
									)
							]
						});
						rejected = true;
					});
			}
		});
	}
			
};