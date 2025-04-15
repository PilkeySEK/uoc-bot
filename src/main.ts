import * as path from "node:path";
import * as fs from "node:fs";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { token } from '../config.json';
import { Command } from "./util/util";
import { fileURLToPath } from "node:url";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let commands: Collection<string, Command> = new Collection();
const foldersPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = (await import(filePath)).default;
		commands.set(command.data.name, command);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

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
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);