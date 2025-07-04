import beautify from 'js-beautify';
const beautifyHtml = beautify.html;
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generarEsquemaJSON } from '../structura/generarEsquemaJSON.js';
import { generarHTMLMedMaster } from '../html/generarHTMLMedMaster.js';
import { sanitizeHtmlContent } from '../validator/htmlSanitizer.js';
import { checkHtmlRules } from '../validator/ruleChecker.js';
import { htmlToPdf } from '../pdf/htmlToPdf.js';
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const CHUNK_TOKEN_SIZE = 10000;
function chunkTextByTokens(text, maxTokens = CHUNK_TOKEN_SIZE) {
    const maxChars = maxTokens * 4;
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(text.length, start + maxChars);
        let slice = text.slice(start, end);
        if (end < text.length) {
            const idx = slice.lastIndexOf('. ');
            if (idx > 0) {
                slice = slice.slice(0, idx + 1);
                end = start + slice.length;
            }
        }
        chunks.push(slice.trim());
        start = end;
    }
    return chunks;
}
async function transcribeAudio(buffer, mimeType) {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    { text: 'Transcribe el siguiente audio en texto:' },
                    { inlineData: { mimeType, data: buffer.toString('base64') } }
                ]
            }
        ]
    });
    return result.response?.text() || '';
}
export async function procesarAudioMedMaster(buffer, mimeType) {
    const rawText = await transcribeAudio(buffer, mimeType);
    const bloques = chunkTextByTokens(rawText);
    const htmlFragments = [];
    for (const texto of bloques) {
        const esquema = await generarEsquemaJSON(texto);
        const html = await generarHTMLMedMaster(esquema);
        htmlFragments.push(html);
    }
    const fullHtml = htmlFragments.join('\n\n');
    const cleanHtml = sanitizeHtmlContent(fullHtml);
    checkHtmlRules(cleanHtml);
    const prettyHtml = beautifyHtml(cleanHtml, {
        indent_size: 2,
        wrap_line_length: 0,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        end_with_newline: true
    });
    const pdfBuffer = await htmlToPdf(prettyHtml);
    return { pdfBuffer, rawText, prettyHtml };
}
//# sourceMappingURL=procesarAudioMedMaster.js.map