import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { default_color, default_footer } from '../../util/util';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),

    execute: async (interaction: CommandInteraction) => {
        const latency = Math.abs(Date.now() - interaction.createdTimestamp);
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Pong!**\n__Latency__: ${latency} ms`)
                    .setColor(default_color)
                    .setTimestamp()
                    .setFooter(default_footer)
            ]
        })
    }
}