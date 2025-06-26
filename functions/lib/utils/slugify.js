export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}
export function extractTitle(html) {
    const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return match ? match[1].trim() : null;
}
//# sourceMappingURL=slugify.js.map