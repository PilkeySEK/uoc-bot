import { CacheType, Collection, Events, Interaction, MessageFlags } from "discord.js";
import { Command } from "../util/util";

export default {
    name: Events.InteractionCreate,
    commands: true,
    async execute(commands: Collection<string, Command>, interaction: Interaction<CacheType>) {
        if (interaction.isChatInputCommand()) {

            const command = commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        }
    }
}