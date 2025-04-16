import { CacheType, Collection, EmbedBuilder, Events, Interaction, MessageFlags } from "discord.js";
import { Command, default_color, default_footer, edit_vote_message } from "../util/util";
import { get_vote, set_vote_options } from "../util/db";

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
        else if (interaction.isStringSelectMenu()) {
            const customId = interaction.customId;
            const values = interaction.values;
            if(customId.startsWith("vote_options_selection_")) {
                const vote_id = customId.slice("vote_options_selection_".length);
                const vote = await get_vote(vote_id);
                if(vote == null) {
                    interaction.reply({content: `:x: Couldn't find the vote with id \`${vote_id}\``, flags: MessageFlags.Ephemeral});
                    return;
                }
                const selected_option = values[0];
                vote.options.forEach((option, index) => {
                    vote.options[index].voters = vote.options[index].voters.filter(voter => voter != interaction.user.id);
                });
                vote.options.forEach((option, index) => {
                    if(option.description != selected_option) return;
                    vote.options[index].voters.push(interaction.user.id);
                })
                const set_vote_options_res = await set_vote_options(vote.id, vote.options);
                if(set_vote_options_res) {
                    interaction.reply({embeds: [
                        new EmbedBuilder()
                            .setDescription("Your vote has been registered!")
                            .setFooter(default_footer)
                            .setTimestamp()
                            .setColor(default_color)
                    ], flags: MessageFlags.Ephemeral});
                }
                else {
                    interaction.reply({embeds: [
                        new EmbedBuilder()
                            .setDescription(":x: Something went wrong in the database :(\nFailed to register your vote.")
                            .setFooter(default_footer)
                            .setTimestamp()
                            .setColor(default_color)
                    ], flags: MessageFlags.Ephemeral});
                }
                edit_vote_message(interaction.message, vote.id);
            }

        }
    }
}