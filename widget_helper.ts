import { request } from 'undici';

// const DataValues = {
//     pfp_url?: string, //*
//     display_name?: string, //*
//     mini_data_string?: string, //*
//     rated_1_image?: string, //*
//     rated_1_name?: string, //*
//     rated_2_image?: string, //*
//     rated_2_name?: string, //*
//     rated_3_image?: string, //*
//     rated_3_name?: string,  //*
//     vns_logged?: number, //*
//     duration_read_formatted?: string, //*
//     cr_title?: string, //*
//     recently_wishlisted?: string, //*
//     recently_finished?: string, //*
//     favourite_tag?: string, //*
// };

const DataValues = ["pfp_url", "display_name", "mini_data_string", "rated_1_image", "rated_1_name", "rated_2_image", "rated_2_name", "rated_3_image", "rated_3_name", "vns_logged", "duration_read_formatted", "cr_title", "recently_wishlisted", "recently_finished", "favourite_tag"] as const;

export type DynamicData = {
    type: number,
    name: typeof DataValues[number],
    value: any,
}[];

export const WidgetDataTypes = Object.freeze({
    String: 1,
    Number: 2,
    URL: 3,
});

export function formatTime(seconds: number): string {
    // weeks, days, hours
    const weeks = Math.floor(seconds / (7 * 24 * 60 * 60));
    seconds -= weeks * 7 * 24 * 60 * 60;
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * 24 * 60 * 60;
    const hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * 60 * 60;

    return `${weeks > 0 ? `${weeks}w ` : ""}${days > 0 ? `${days}d ` : ""}${hours > 0 ? `${hours}h` : ""}`.trim() || "--";
}

export async function dispatchWidgetUpdate(interaction: any, dynamic_data: DynamicData) {
    const apiURL = `https://discord.com/api/v9/applications/${process.env.CLIENT_ID}/users/${interaction.user.id}/identities/0/profile`;

    const payload = {
        username: interaction.user.username,
        data: {
            dynamic: dynamic_data,
        }
    }

    try {
        const response = await request(apiURL, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${process.env.TOKEN}`,
                "User-Agent": "DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)"
            },
            body: JSON.stringify(payload)
        });

        console.log(response.statusCode, await response.body.text());
    } catch (error) {
        console.error("Failed to dispatch widget update:", error);
    }
};