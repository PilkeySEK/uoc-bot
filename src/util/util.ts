import { ActionRowBuilder, ClientEvents, ColorResolvable, CommandInteraction, EmbedBuilder, EmbedFooterOptions, Message, SendableChannels, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { footer_icon_url } from "../../config.json";
import { get_vote, Vote } from "./db";

export class Command {
    constructor(data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>) {
        this.data = data;
        this.execute = execute;
    }
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export class Event {
    name: keyof ClientEvents;
    once: boolean = false;
    commands: boolean = false;
    execute: (...args) => void;
}

export const default_footer: EmbedFooterOptions = { text: "UOC Helper", iconURL: footer_icon_url };
export const default_color: ColorResolvable = 0xFFFFFF;

export async function send_vote_message(channel: SendableChannels, vote: Vote) {
    const select_menu_options: StringSelectMenuOptionBuilder[] = [];
    let options_string = "";
    vote.options.forEach(option => {
        options_string += "**" + option.description + "**\n";
        options_string += "__Votes__: " + option.voters.length;
        options_string += "\n";

        select_menu_options.push(new StringSelectMenuOptionBuilder()
            .setLabel(option.description)
            .setValue(option.description)
        );
    });

    const select = new StringSelectMenuBuilder()
        .setCustomId(`vote_options_selection_${vote.id}`)
        .setPlaceholder("Make a selection ...")
        .addOptions(...select_menu_options)
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(vote.id)
                .setDescription(`
            ${vote.description}
            
            ### Options
            ${options_string}
        `)
                .setColor(default_color)
                .setFooter(default_footer)
                .setTimestamp()
        ],
        components: [row]
    });
}

export async function edit_vote_message(message: Message, vote_id: string) {
    const vote = await get_vote(vote_id);
    if (vote == null) return;

    const select_menu_options: StringSelectMenuOptionBuilder[] = [];
    let options_string = "";
    vote.options.forEach(option => {
        options_string += "**" + option.description + "**\n";
        options_string += "__Votes__: " + option.voters.length;
        options_string += "\n";

        select_menu_options.push(new StringSelectMenuOptionBuilder()
            .setLabel(option.description)
            .setValue(option.description)
        );
    });

    const select = new StringSelectMenuBuilder()
        .setCustomId(`vote_options_selection_${vote.id}`)
        .setPlaceholder("Make a selection ...")
        .addOptions(...select_menu_options)
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);

    message.edit({
        embeds: [
            new EmbedBuilder()
                .setTitle(vote.id)
                .setDescription(`
            ${vote.description}
            
            ### Options
            ${options_string}
        `)
                .setColor(default_color)
                .setFooter(default_footer)
                .setTimestamp()
        ],
        components: [row]
    })
}