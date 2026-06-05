import { SlashCommandBuilder, type Interaction } from "discord.js";
import * as vndb from '../vndb_helper';
import { formatTime, WidgetDataTypes, type DynamicData, dispatchWidgetUpdate } from '../widget_helper';

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('add your vndb info to the widget :p')
    .addStringOption(option =>
        option.setName('vndb_id')
            .setDescription('your vndb user id (starts with "u")')
            .setRequired(true)
    ).addStringOption(option =>
        option.setName('pfp_url')
            .setDescription('the URL of your profile picture (optional)')
    ).addStringOption(option =>
        option.setName('display_name')
            .setDescription('the name you want displayed on the widget (optional)')
    ).addBooleanOption(option =>
        option.setName('include_ero_tags')
            .setDescription('whether to include erotic tags in the favourite tag calculation (defaults to false)')
    );

export async function execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const dynamic_data: DynamicData = [];
    dynamic_data.push({ type: WidgetDataTypes.String, name: "display_name", value: interaction.options.getString('display_name') || interaction.user.username });
    dynamic_data.push({ type: WidgetDataTypes.URL, name: "pfp_url", value: {url: interaction.options.getString('pfp_url') || interaction.user.displayAvatarURL()} });
    
    const list = (await vndb.getVnList(interaction.options.getString('vndb_id', true)) as vndb.VnListResponse).results;

    dynamic_data.push({ type: WidgetDataTypes.Number, name: "vns_logged", value: list.length });

    const rated = list.filter(x => x.vote !== null);
    const top_three = rated.slice(0, 3);

    for (let i = 0; i < top_three.length; i++) { // TODO this will cause errors if there are not at least 3 entries, fix later
        if (i === 0) dynamic_data.push({ type: WidgetDataTypes.String, name: "mini_data_string", value: `Highest Rated: ${top_three[i]!.vn.title}` });
        dynamic_data.push({ type: WidgetDataTypes.String, name: `rated_${i + 1}_name` as any, value: top_three[i]!.vn.title });
    };

    const aggregate = await vndb.getAggregateData(list, interaction.options.getBoolean('include_ero_tags') || false);
    // const tags_by_rating = Array.from(aggregate.tags.entries()).sort((a, b) => (a[1].total_rating / a[1].count) - (b[1].total_rating / b[1].count));
    const tags_by_rating = Array.from(aggregate.tags.entries()).sort((a, b) => (b[1].total_rating) - (a[1].total_rating));

    dynamic_data.push({ type: WidgetDataTypes.String, name: "duration_read_formatted", value: formatTime(aggregate.total_length_minutes * 60) });
    dynamic_data.push({ type: WidgetDataTypes.String, name: "favourite_tag", value: tags_by_rating[0]?.[0] ? await vndb.getTagName(tags_by_rating[0][0]) : "--" });

    const vns_by_updated = list.sort((a, b) => b.lastmod - a.lastmod);
    // TODO use finished data instead of modified timestamp for recently_finished
    dynamic_data.push({ type: WidgetDataTypes.String, name: "recently_finished", value: vns_by_updated.find(x => x.labels.some(label => label.label === "Finished"))?.vn.title || "--" });
    dynamic_data.push({ type: WidgetDataTypes.String, name: "recently_wishlisted", value: vns_by_updated.find(x => x.labels.some(label => label.label === "Wishlist"))?.vn.title || "--" });
    dynamic_data.push({ type: WidgetDataTypes.String, name: "cr_title", value: vns_by_updated.find(x => x.labels.some(label => label.label === "Playing"))?.vn.title || "--" });

    // console.log(dynamic_data);
    await dispatchWidgetUpdate(interaction, dynamic_data);

    await interaction.reply({ content: 'updated!', ephemeral: true });
}