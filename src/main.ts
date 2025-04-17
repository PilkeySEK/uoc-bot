import * as path from "node:path";
import * as fs from "node:fs";
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { token } from '../config.json';
import { Command, Event } from "./util/util";
import { fileURLToPath } from "node:url";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands: Collection<string, Command> = new Collection();
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event: Event = (await import(filePath)).default;
	if (event.once) {
		if(event.commands) {
			client.once(event.name, (...args) => event.execute(commands, ...args));
		}
		else {
			client.once(event.name, (...args) => event.execute(...args));
		}
	} else {
		if(event.commands) {
			client.on(event.name, (...args) => event.execute(commands, ...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

client.login(token);