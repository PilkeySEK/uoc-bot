import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import { client_id, token } from '../config.json';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from './util/util';

export async function deploy() {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] | any[] = [];
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command: Command = (await import(filePath)).default;
			commands.push(command.data.toJSON());
		}
	}

	const rest = new REST().setToken(token);

	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			const data: any = await rest.put(
				Routes.applicationCommands(client_id),
				{ body: commands },
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error(error);
		}
	})();
}
deploy();