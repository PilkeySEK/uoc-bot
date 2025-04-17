import { ClientEvents, ColorResolvable, CommandInteraction, EmbedFooterOptions, SlashCommandBuilder } from "discord.js";
import { footer_icon_url } from "../../config.json";

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