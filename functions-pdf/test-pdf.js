const axios = require("axios");
const fs = require("fs");

// Reemplaza por la URL de tu microservicio PDF
const endpoint = "https://generatenotefrompdf-489873459052.us-central1.run.app/generate-pdf";

// Ejemplo de HTML simple a convertir a PDF
const htmlBruto = `
  <div>
    <h1 style="color: #6a4fc7;">¡Apunte de Prueba!</h1>
    <p>Esto es un <strong>test automático</strong> de la función PDF.</p>
    <ul>
      <li>Paso 1: Verificar endpoint</li>
      <li>Paso 2: Generar PDF</li>
    </ul>
  </div>
`;

async function testPdfGeneration() {
  try {
    const response = await axios.post(
      endpoint,
      { html: htmlBruto }, // IMPORTANTE: manda como { html: ... }
      { responseType: "arraybuffer" } // Para recibir el PDF como buffer
    );
    fs.writeFileSync("apunte-test.pdf", response.data);
    console.log("✅ PDF generado correctamente (apunte-test.pdf)");
  } catch (err) {
    console.error("❌ Error generando PDF:", err?.response?.data || err.message || err);
  }
}

testPdfGeneration();