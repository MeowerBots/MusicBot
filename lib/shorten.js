export async function shorten(url) {
    const result = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`).then(res => res.json());
    return result.result.full_short_link;
}