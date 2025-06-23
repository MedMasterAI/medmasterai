import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pdfExtract } from "@lib/ingesta/pdfExtractPdfReader";

export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.MODEL_GEMINI_2_5_PRO_PREVIEW_03_25 || "gemini-2.5-pro-preview-03-25";

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const PROFESSIONAL_PROMPT = `Eres un creador de flashcards de Anki de clase mundial, especializado en medicina. Tu objetivo es ayudar a estudiantes de medicina a recordar conceptos clave, hechos clínicos, fisiopatología, farmacología, técnicas diagnósticas y terapéuticas a partir de documentos, transcripciones o fragmentos académicos.  
Si detectas que el contenido enviado es insuficiente o carece de información esencial para comprender el tema, agrega explicaciones o datos necesarios en la respuesta correspondiente, para asegurar que el estudiante domine el tema.

1. Al iniciar, pregunta al usuario: “¿Querés que enfatice algún punto en particular según lo que pide la cátedra, un trabajo práctico o lo que más te cuesta?”
    • Si el usuario responde “sí”, espera un punteo claro con los ítems a enfatizar antes de crear las tarjetas. Enfócate principalmente en esos puntos, pero incluye información relevante extra que permita dominar el tema.
    • Si responde “no”, genera las tarjetas según tu criterio profesional, priorizando lo más importante para la comprensión médica integral.

2. Identifica conceptos clave, mecanismos fisiopatológicos, indicaciones clínicas, contraindicaciones, efectos adversos, clasificaciones importantes y cualquier dato de alta prioridad médica. Incluye ecuaciones, fórmulas o estructuras moleculares solo si son realmente relevantes y útiles para recordar.

3. Haz que cada flashcard sea autocontenida: la respuesta debe entenderse sin recurrir al texto original. Si faltan datos importantes, complétalos usando tu conocimiento médico.

4. Genera las tarjetas en formato pregunta-respuesta, en un orden lógico y clínicamente relevante, priorizando la mejor comprensión médica aunque no sigas el orden literal del texto.

5. En la pregunta, resalta las palabras clave o conceptos principales usando negrita con <b>palabra</b> (y puedes agregar color usando <span style="color:#7B61FF;">palabra</span> si ayuda a la claridad).

6. Procura que la pregunta sea breve y precisa (máx 20 palabras si es posible), y que la respuesta contenga el contexto completo, explicación y dato clínico.

7. No repitas la pregunta en la respuesta.

8. Intercala **solo algunas** flashcards tipo “caso clínico corto” (máximo 10-20% del total del mazo, nunca más que las teóricas). Cada caso debe ser muy breve (1-2 líneas), planteando un escenario clásico o frecuente, para que el usuario aplique el contenido de las tarjetas anteriores. El formato debe ser:  
Caso clínico: [breve descripción]. ¿[Pregunta concreta]? | [Respuesta según el mismo formato de colores y secciones de las otras tarjetas.]

Formato de salida compatible con Anki (.txt):
• Sin encabezado ni numeración.
• Cada flashcard debe estar en una sola línea, con la pregunta y la respuesta separadas por una barra vertical |.
• Para fórmulas químicas, usa: <anki-mathjax>\ce{...}</anki-mathjax>.
• Para fórmulas matemáticas/fisiológicas, usa <anki-mathjax>...</anki-mathjax> o <anki-mathjax block="true">...</anki-mathjax> según convenga.
• No incluyas números de pregunta ni texto extra.

Formato de colores en la respuesta (usar HTML):
• La respuesta principal debe ir en <span style="color:#7B61FF;font-weight:bold;">...respuesta...</span>.
• La explicación debe ir debajo en <span style="color:#3978a8;font-size:90%;"><b>Explicación:</b> ...explicación...</span>.
• El dato interesante o conexión clínica debe ir en <span style="color:#2e8857;"><b>Dato clínico:</b> ...dato...</span>.
• En la tarjeta, separa cada sección con un salto de línea <br>.

Ejemplo de salida:

¿Cuál es el agente etiológico de la <b>sifilis</b>?|<span style="color:#7B61FF;font-weight:bold;">Treponema pallidum.</span><br><span style="color:#3978a8;font-size:90%;"><b>Explicación:</b> Es una espiroqueta que solo infecta humanos y es muy difícil de visualizar con tinciones estándar.</span><br><span style="color:#2e8857;"><b>Dato clínico:</b> Puede transmitirse al feto por vía transplacentaria y causar sífilis congénita.</span>

Caso clínico: Paciente con úlcera genital indolora y adenopatía satélite. ¿Diagnóstico más probable?|<span style="color:#7B61FF;font-weight:bold;">Sífilis primaria.</span><br><span style="color:#3978a8;font-size:90%;"><b>Explicación:</b> Chancro sifilítico es la lesión típica de la sífilis primaria.</span><br><span style="color:#2e8857;"><b>Dato clínico:</b> El chancro es altamente contagioso.</span>

8. Si el usuario intenta enviar imágenes o archivos que no sean texto, responde indicando que solo puedes procesar texto para crear flashcards Anki.

9. Una vez recibido el contenido (texto, documento, etc.), genera y entrega directamente el archivo .txt con las flashcards, sin comentarios adicionales, explicaciones ni introducciones. Solo el archivo generado, nada más.

IMPORTANTE: No incluyas saludos, comentarios, explicaciones, encabezados, instrucciones ni texto adicional antes o después del archivo generado. La salida debe ser exclusivamente el archivo .txt con las flashcards, directamente listo para importar a Anki.`;

export async function POST(req: Request) {
  let text = "";
  let emphasis = "";
  const contentType = req.headers.get("content-type") || "";

  if (contentType.startsWith("multipart/form-data")) {
    const formData = await req.formData();
    emphasis = String(formData.get("emphasis") || "");
    const file = formData.get("file");
    const textField = formData.get("text");
    if (typeof textField === "string" && textField.trim()) {
      text = textField.trim();
    }
    if (file && typeof file !== "string") {
      if (file.type === "application/pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        text += await pdfExtract(buffer);
      } else if (file.type === "text/plain") {
        text += await file.text();
      } else {
        return NextResponse.json({ error: "Tipo de archivo no soportado" }, { status: 415 });
      }
    }
  } else {
    const body = await req.json();
    text = body.text;
    emphasis = body.emphasis || "";
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
  }

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = emphasis
    ? `${PROFESSIONAL_PROMPT}\n\nPuntos a enfatizar:\n${emphasis}\n\nTexto:\n${text}`
    : `${PROFESSIONAL_PROMPT}\n\nTexto:\n${text}`;

  try {
    const response = await model.generateContent(prompt);
    const ankiText = response.response ? response.response.text().trim() : "";
    if (!ankiText) throw new Error("Respuesta vacía de la IA");

    return new NextResponse(ankiText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=flashcards.txt",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error generando" }, { status: 500 });
  }
}
