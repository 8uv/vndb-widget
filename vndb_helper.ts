import { request } from 'undici';

type VnListEntry = {
    id: string,
    labels: [
        // [Object ...]
        {label: string}
    ],
    lastmod: number,
    vn: {
        title: string,
    },
    vote: number | null,
}

async function vndbRequest(endpoint: string, params: Record<string, any>): Promise<any> {
    const url = `https://api.vndb.org/kana/${endpoint}`;
    const response = await request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    if (response.statusCode !== 200) throw new Error(`api request failed: ${await response.body.text()}`);
    return response.body.json();
};

/** Implicitly includes VNs with vote = null. */
export function getVnList(userId: string, sort: string = "vote"): Promise<VnListEntry[]> {
    return vndbRequest('ulist', {
        user: userId,
        fields: "vn.title, vote, labels.label, lastmod",
        sort: sort,
        reverse: true,
        results: 100
    });
};


// const test_data = await vndbRequest('vn', {
//     filters: ["id", "=", "v3144"],
//     fields: "tags.id, tags.rating",
// });
const test_data = await getVnList('u321093');
// console.log(test_data.results.map((x: any) => x.labels));
// console.log(test_data.results.sort((a: any, b: any) => b.lastmod - a.lastmod));