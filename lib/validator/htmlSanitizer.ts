import sanitizeHtml from 'sanitize-html'

/**
 * Elimina etiquetas y atributos no permitidos,
 * dejando solo las tags y clases que usa MedMaster.
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/```.*$/g, '')
}

export function sanitizeHtmlContent(html: string): string {
  const withoutCode = stripCodeFences(html)
  return sanitizeHtml(withoutCode, {
    allowedTags: [
      'h1','h2','h3','p','ul','ol','li',
      'div','span','table','thead','tbody','tr','th','td',
      'blockquote','strong'
    ],
    allowedAttributes: {
      div: ['class'],
      span: ['class'],
      ul: ['class'],
      ol: ['class'],
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
      strong: []
    },
    // Descarta todo lo que no esté en allowedTags
    disallowedTagsMode: 'discard'
  })
}
