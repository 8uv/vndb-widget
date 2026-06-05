import { request } from 'undici';

export type VnListResponse = {
    more: boolean,
    results: VnListEntry[],
}

type VnResponse = {
    more: boolean,
    results: AggregateDataEntry[],
}

export type VnListEntry = {
    id: string,
    labels: [
        // [Object ...]
        { label: string }
    ],
    lastmod: number,
    vn: {
        title: string,
    },
    vote: number | null,
}

type AggregateDataEntry = {
    id: string,
    length_minutes: number | null,
    tags: {
        id: string,
        rating: number,
        category: string,
    }[]
}

export type AggregateData = {
    total_length_minutes: number,
    tags: Map<string, { count: number, total_rating: number }>,
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
export function getVnList(userId: string, sort: string = "vote"): Promise<VnListResponse> {
    return vndbRequest('ulist', {
        user: userId,
        fields: "vn.title, vote, labels.label, lastmod",
        sort: sort,
        reverse: true,
        results: 100
    });
};

export function getTagName(tagId: string): Promise<string> {
    return vndbRequest('tag', {
        filters: ["id", "=", tagId],
        fields: "name",
    }).then((data: any) => data.results[0]?.name);
}

export async function getAggregateData(list: VnListEntry[], ero: boolean = false): Promise<AggregateData> {
    const aggregate: AggregateData = {
        total_length_minutes: 0,
        tags: new Map<string, { count: number, total_rating: number }>(),
    }

    for (const entry of list) {
        const data: VnResponse = await vndbRequest('vn', {
            filters: ["id", "=", entry.id],
            fields: "length_minutes, tags.id, tags.rating, tags.category",
        });

        if (data.results.length === 0) continue;
        const vnData: AggregateDataEntry = data.results[0]!;

        // aggregate.total_length_minutes += vnData.length_minutes || 0;
        if (entry.labels.some(label => label.label === "Finished")) aggregate.total_length_minutes += vnData.length_minutes || 0;

        const tag_categories = ero ? ["cont", "ero"] : ["cont"];
        const boring_tags = ["g133", "g848"];
        for (const tag of vnData.tags.filter(x => tag_categories.includes(x.category) && !boring_tags.includes(x.id))) {
            if (!aggregate.tags.has(tag.id)) aggregate.tags.set(tag.id, { count: 0, total_rating: 0 });
            const tagData = aggregate.tags.get(tag.id)!;

            tagData.count++;
            tagData.total_rating += tag.rating;
        }
    };

    // console.log(Array.from(aggregate.tags).sort((a, b) => (b[1].total_rating) - (a[1].total_rating)));
    return aggregate;
};