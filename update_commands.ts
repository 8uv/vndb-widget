import { REST, Routes } from 'discord.js';
import path from 'path';
import fs from 'fs';

const TOKEN = process.env.TOKEN as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const COMMANDS_PATH = path.join(__dirname, 'commands');
const COMMAND_FILES = fs.readdirSync(COMMANDS_PATH).filter(file => file.endsWith('.ts'));

const commands: any[] = [];

for (const file of COMMAND_FILES) {
    const filePath = path.join(COMMANDS_PATH, file);
    const command = await import(filePath);
    if (!command.data || !command.execute) throw new Error(`command ${file} is missing a required "data" or "execute" property.`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    if(commands.length === 0) throw new Error("no commands found");

    await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands },
    );
} catch (error) {
    console.error(error);
}