import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { default_color, default_footer } from '../../util/util';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('What\'s this??'),

    execute: async (interaction: CommandInteraction) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`
                        ## What is UOC?
                        The United Openfront Clans (short: UOC) is a **democratic organization**, focusing on peacekeeping and diplomacy. It is a neutral ground for any clan-related discussions, talk and similar.
                        Read https://discord.com/channels/1359065506383921242/1359068866835386450 for a more detailed introduction. If you want to go in-depth, read the https://discord.com/channels/1359065506383921242/1359068868731076739 and https://discord.com/channels/1359065506383921242/1360285031087739131 .
                        
                        ## What is this bot?
                        This is the helper bot of UOC, it is responsible for hosting votes, adding roles and other things. (currently WIP)
                        `)
                    .setColor(default_color)
                    .setTimestamp()
                    .setFooter(default_footer)
            ]
        })
    }
}