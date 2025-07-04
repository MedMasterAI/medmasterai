"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlToPdf = htmlToPdf;
const puppeteer_1 = require("puppeteer");
/**
 * Genera un PDF a partir de HTML usando Puppeteer y Google Chrome.
 * @param fragmentoHtml HTML que se inserta en el body.
 * @returns Uint8Array con el buffer del PDF.
 */
async function htmlToPdf(fragmentoHtml) {
    const fullHtml = `
   <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Apuntes MedMaster</title>

  <!-- Fuente Nunito -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Nunito', 'Segoe UI', 'Helvetica Neue', sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #2c3e50;
      background-color: #ffffff;
      margin: 0;
      padding: 40px;
    }

    #contenido {
      font-family: 'Nunito', 'Segoe UI', sans-serif;
    }

    h1 {
      text-align: center;
      color: #6a4fc7;
      font-size: 34px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }

    h2 {
      text-align: left;
      color: #6a4fc7;
      font-size: 25px;
      margin-top: 40px;
      margin-bottom: 20px;
      page-break-inside: avoid;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h3 {
      text-align: left;
      color: #6a4fc7;
      font-size: 19px;
      margin-top: 30px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    p {
      margin-bottom: 16px;
      text-align: justify;
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }

    ul, ol {
      margin: 0 0 16px 25px;
      page-break-inside: avoid;
    }

    blockquote {
      border-left: 4px solid #6a4fc7;
      background-color: #f6f3ff;
      padding: 14px 20px;
      margin: 20px 0;
      font-style: italic;
      color: #444;
      border-radius: 8px;
      page-break-inside: avoid;
    }

    .bloque-definicion,
    .bloque-alerta,
    .conceptos-clave,
    .mini-card,
    .vision-description,
    table {
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .bloque-definicion {
      background-color: #efeaff;
      border-left: 5px solid #6a4fc7;
    }

    .bloque-alerta {
      background-color: #fdf2ff;
      border-left: 5px solid #a24bb0;
    }

    .conceptos-clave {
      background-color: #f3efff;
      border-left: 5px solid #6a4fc7;
    }

    .mini-card {
      background-color: #fbfaff;
      border: 2px dashed #6a4fc7;
      border-radius: 10px;
      padding: 16px 20px;
    }

    .vision-description {
      background-color: #f0f5ff;
      border-left: 5px solid #4c6ef5;
      font-style: italic;
      color: #333;
    }

    ul.mapa-mental {
      list-style-type: '➤ ';
      margin-left: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    ul.mapa-mental ul {
      list-style-type: '• ';
      margin-left: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: left;
    }

    th {
      background-color: #f1ebff;
      color: #6a4fc7;
    }

    .violeta { color: #6a4fc7; font-weight: bold; }
    .rojo    { color: #a24bb0; font-weight: bold; }
    .azul    { color: #4c6ef5; font-weight: bold; }
    .verde   { color: #22a6b3; font-weight: bold; }
    .emoji   { font-size: 1.2em; margin-right: 6px; }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>

<body>
      <div id="contenido">
        ${fragmentoHtml}
      </div>
    </body>
    </html>
  `;
    const browser = await (0, puppeteer_1.launch)({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdfBuf = await page.pdf({
        format: "Letter",
        margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
        printBackground: true,
    });
    await browser.close();
    return pdfBuf;
}
