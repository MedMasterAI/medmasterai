// src/lib/pdf/extraerPaginasConImagenes.ts
import * as pdfjsLib from "pdfjs-dist";
const { getDocument, OPS } = pdfjsLib;

export async function detectarPaginasConImagenes(buffer: Buffer): Promise<number[]> {
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const paginasConImagen: number[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const ops = await page.getOperatorList();

      const contieneImagen = ops.fnArray.some((op: number) =>
        op === OPS.paintImageXObject ||
        op === OPS.paintInlineImageXObject );

      if (contieneImagen) {
        paginasConImagen.push(i);
      }
    } catch (error) {
      console.warn(`⚠️ Error al procesar página ${i}:`, error);
    }
  }

  return paginasConImagen;
}
