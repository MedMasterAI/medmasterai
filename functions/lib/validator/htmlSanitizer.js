import sanitizeHtml from "sanitize-html";
/**
 * Elimina etiquetas y atributos no permitidos,
 * dejando solo las tags y clases que usa MedMaster.
 */
function stripCodeFences(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/```.*$/g, '');
}
/**
 * Elimina cualquier encabezado o comentario textual
 * antes de la primera etiqueta HTML.
 */
function stripPreamble(text) {
    const idx = text.search(/<\s*[a-zA-Z]/);
    return idx >= 0 ? text.slice(idx) : text;
}
export function sanitizeHtmlContent(html) {
    const withoutCode = stripCodeFences(html);
    const cleanStart = stripPreamble(withoutCode);
    return sanitizeHtml(cleanStart, {
        allowedTags: [
            "h1", "h2", "h3", "p", "ul", "ol", "li",
            "div", "span", "table", "thead", "tbody", "tr", "th", "td",
            "blockquote", "strong",
        ],
        allowedAttributes: {
            div: ["class"],
            span: ["class"],
            ul: ["class"],
            ol: ["class"],
            table: [],
            thead: [],
            tbody: [],
            tr: [],
            th: [],
            td: [],
            h1: [],
            h2: [],
            h3: [],
            p: [],
            li: [],
            blockquote: [],
            strong: [],
        },
        // Descarta todo lo que no esté en allowedTags
        disallowedTagsMode: "discard",
    });
}
//# sourceMappingURL=htmlSanitizer.js.map