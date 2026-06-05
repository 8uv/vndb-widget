import path from 'path';
import fs from 'fs';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';

const TOKEN = process.env.TOKEN;
const COMMANDS_PATH = path.join(__dirname, 'commands');
const COMMAND_FILES = fs.readdirSync(COMMANDS_PATH).filter(file => file.endsWith('.ts'));

type Command = {
    data: {
        name: string,
    },
    execute: (interaction: any) => Promise<void>,
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection();

for (const file of COMMAND_FILES) {
    const filePath = path.join(COMMANDS_PATH, file);
    const command: Command = await import(filePath);
    if (!command.data || !command.execute) throw new Error(`command ${file} is missing a required "data" or "execute" property.`);
    commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName) as Command | undefined;
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

client.once(Events.ClientReady, async readyClient => {
    console.log(`logged in as ${readyClient.user.tag}\n`);
});

client.login(TOKEN);