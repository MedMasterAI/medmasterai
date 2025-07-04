import express, { Request, Response } from "express";
import { htmlToPdf } from "./lib/htmlToPdf";
import cors from "cors";
import { logger } from "./logger";

const app = express();

// Middleware global
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: "20mb" }));

app.post("/generate-pdf", async (req: Request, res: Response) => {
  // LOGGING para depuración robusta
  logger.log("HEADERS:", req.headers);
  logger.log("REQ.BODY (entero):", req.body);
  logger.log("Tipo recibido:", typeof req.body.html);
  logger.log("Largo recibido:", req.body.html?.length);
  logger.log("Preview recibido:", req.body.html?.slice(0, 200));

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
    logger.error("Error en /generate-pdf:", error);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.log(`Servidor PDF corriendo en puerto ${PORT}`);
});