import { ButtonBuilder, ComponentBuilder, SlashCommandBuilder, type Interaction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('sets up the bot for the first time');

export async function execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const auth_button = new ButtonBuilder()
        .setLabel('Authenticate with VNDB')
        .setStyle(5) // Link button
        .setURL('https://discord.com/oauth2/authorize?client_id=1512210864172957716&response_type=token&redirect_uri=https%3A%2F%2Fsuperfuckingmario.com&scope=openid+sdk.social_layer');

    
}