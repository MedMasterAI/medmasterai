import sanitizeHtml from "sanitize-html";
/**
 * Elimina etiquetas y atributos no permitidos,
 * dejando solo las tags y clases que usa MedMaster.
 */
export function sanitizeHtmlContent(html) {
    return sanitizeHtml(html, {
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
            h1: [], h2: [], h3: [],
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