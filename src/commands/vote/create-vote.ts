import { CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { default_color, default_footer } from '../../util/util';
import { create_vote, Vote, VoteType } from '../../util/db';

export default {
    data: new SlashCommandBuilder()
        .setName('create-vote')
        .setDescription('Create a new vote')
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Who can vote?")
                .setRequired(true)
                .addChoices(
                    { name: "Council Only", value: "council_only" },
                    { name: "Everyone", value: "everyone" }
                )
        )
        .addStringOption(option =>
            option.setName("name")
                .setDescription("A good name")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("time")
                .setDescription("Time in hours")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option1")
                .setDescription("The first option")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option2")
                .setDescription("The second option")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("option3")
                .setDescription("The third option")
        )
        .addStringOption(option =>
            option.setName("option4")
                .setDescription("The fourth option")
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("A good description, if needed")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async (interaction: CommandInteraction) => {
        const type = interaction.options.get("type", true).value as string;
        const name = interaction.options.get("name", true).value as string;
        const description = interaction.options.get("description")?.value as string | undefined;
        const time = interaction.options.get("time", true).value as number;
        const option1 = interaction.options.get("option1", true).value as string;
        const option2 = interaction.options.get("option2", true).value as string;
        const option3 = interaction.options.get("option3")?.value as string | undefined;
        const option4 = interaction.options.get("option4")?.value as string | undefined;

        let vote: Vote = {
            id: name,
            description: description == undefined ? "" : description,
            endTimestamp: Date.now() + 3600000 * time,
            options: [
                {description: option1, voters: []},
                {description: option2, voters: []}
            ],
            type: type == "council_only" ? VoteType.CouncilOnly : VoteType.Everyone
        }
        if(option3 != undefined) vote.options.push({description: option3, voters: []});
        if(option4 != undefined) vote.options.push({description: option4, voters: []});
        const res = await create_vote(vote);
        if(res) {
            interaction.reply({embeds: [
                new EmbedBuilder()
                    .setDescription(`Successfully created the vote "${name}" with description "${description}"`)
                    .setColor(default_color)
                    .setTimestamp()
                    .setFooter(default_footer)
            ]})
        }
        else {
            interaction.reply({embeds: [
                new EmbedBuilder()
                    .setDescription("Something went wrong :(\nIt is likely that the database is down or the bot isn't able to access it. Please report this if it doesn't fix itself after a few minutes.")
                    .setColor(default_color)
                    .setTimestamp()
                    .setFooter(default_footer)
            ]})
        }
    }
}