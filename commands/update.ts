import { ButtonBuilder, ComponentBuilder, SlashCommandBuilder, type Interaction } from "discord.js";
import * as vndb from '../vndb_helper';

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('add your vndb info to the widget :p')
    .addStringOption(option =>
        option.setName('vndb_id')
            .setDescription('your vndb user id (starts with "u")')
            .setRequired(true)
    );

export async function execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
}