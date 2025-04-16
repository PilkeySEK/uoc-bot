import { ActionRowBuilder, Client, ClientEvents, ColorResolvable, CommandInteraction, EmbedBuilder, EmbedFooterOptions, Message, SendableChannels, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { footer_icon_url } from "../../config.json";
import { _noid_has_vote_ended, get_vote, list_all_votes, move_vote_to_ended_votes, Vote, VoteOption } from "./db";

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

function get_vote_stat(vote: Vote): string {
    let stat_str = "";
    vote.options.forEach(option => {
        stat_str += "| ";
        for(let i = 0; i < option.voters.length; i++) {
            stat_str += "🟩";
        }
        stat_str += " " + option.description + "\n";
    });
    stat_str = stat_str.substring(0, stat_str.length - 1);
    return stat_str;
}

function get_vote_message(vote: Vote): string {
    let options_string = "";
    vote.options.forEach(option => {
        options_string += "**" + option.description + "**\n";
        options_string += "__Votes__: " + option.voters.length;
        options_string += "\n";
    });
    return `${vote.description}\n\n### Options\n${options_string}\n---\n${get_vote_stat(vote)}`;
}

export async function send_vote_message(channel: SendableChannels, vote: Vote) {
    const select_menu_options: StringSelectMenuOptionBuilder[] = [];
    vote.options.forEach(option => {
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

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(vote.id)
                .setDescription(get_vote_message(vote))
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
    vote.options.forEach(option => {
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

    await message.edit({
        embeds: [
            new EmbedBuilder()
                .setTitle(vote.id)
                .setDescription(get_vote_message(vote))
                .setColor(default_color)
                .setFooter(default_footer)
                .setTimestamp()
        ],
        components: [row]
    })
}

export async function end_expired_votes(client: Client<boolean>) {
    const all_votes = await list_all_votes();
    all_votes.forEach(async vote => {
        if (_noid_has_vote_ended(vote)) {
            await send_end_message(vote, client);
            await move_vote_to_ended_votes(vote.id);
        }
    });
}

export async function send_end_message(vote: Vote, client: Client<boolean>) {
    const channel = await client.channels.fetch(vote.channel);
    if (channel == null) {
        console.error(`Failed to fetch channel ${vote.channel}`);
        return;
    }
    if (!channel.isSendable()) {
        console.error(`Channel ${vote.channel} is not sendable!`);
        return;
    }

    let options_string = "";
    vote.options.forEach(option => {
        options_string += "**" + option.description + "**\n";
        options_string += "__Votes__: " + option.voters.length;
        options_string += "\n";
    });

    /*const options_sorted = vote.options.sort((a, b) => {
        return a.voters.length - b.voters.length;
    });*/
    const winners: VoteOption[] = [];
    winners.push(vote.options[0]);
    vote.options.forEach(option => {
        if (option.voters.length == winners[0].voters.length && option.description != winners[0].description) winners.push(option);
    });

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("Vote ended")
                .setDescription(`
                The vote "${vote.id}" has just ended.
                
                ## Results
                ${options_string}
                
                ${get_vote_stat(vote)}
                `)
                .setColor(default_color)
                .setTimestamp()
                .setFooter(default_footer)
        ]
    })
}