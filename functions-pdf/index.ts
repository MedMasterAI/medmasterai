import express, { Request, Response } from "express";
import { htmlToPdf } from "./lib/htmlToPdf";
import cors from "cors";

const app = express();

// Middleware global
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));

app.post("/generate-pdf", async (req: Request, res: Response) => {
  // LOGGING para depuración robusta
  console.log("HEADERS:", req.headers);
  console.log("REQ.BODY (entero):", req.body);
  console.log("Tipo recibido:", typeof req.body.html);
  console.log("Largo recibido:", req.body.html?.length);
  console.log("Preview recibido:", req.body.html?.slice(0, 200));

  try {
    const html = req.body?.html;
    if (typeof html !== "string" || !html.trim()) {
      res.status(400).json({ error: "Missing HTML" });
      return;
    }

    const pdfBuffer = await htmlToPdf(html);

    if (!pdfBuffer || !pdfBuffer.length) {
      throw new Error("PDF buffer vacío");
    }

    res.type("application/pdf").send(pdfBuffer);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
    console.error("Error en /generate-pdf:", error);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor PDF corriendo en puerto ${PORT}`);
});