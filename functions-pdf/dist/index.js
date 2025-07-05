"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const htmlToPdf_1 = require("./lib/htmlToPdf");
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./logger");
const app = (0, express_1.default)();
// Middleware global
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: allowedOrigins,
}));
app.use(express_1.default.json({ limit: "20mb" }));
app.post("/generate-pdf", async (req, res) => {
    // LOGGING para depuración robusta
    logger_1.logger.log("HEADERS:", req.headers);
    // Evitar imprimir el cuerpo completo para reducir I/O
    logger_1.logger.log("REQ.BODY keys:", Object.keys(req.body));
    logger_1.logger.log("Tipo recibido:", typeof req.body.html);
    logger_1.logger.log("Largo recibido:", req.body.html?.length);
    logger_1.logger.log("Preview recibido:", req.body.html?.slice(0, 200));
    try {
        const html = req.body?.html;
        if (typeof html !== "string" || !html.trim()) {
            res.status(400).json({ error: "Missing HTML" });
            return;
        }
        const pdfBuffer = await (0, htmlToPdf_1.htmlToPdf)(html);
        if (!pdfBuffer || !pdfBuffer.length) {
            throw new Error("PDF buffer vacío");
        }
        res.type("application/pdf").send(pdfBuffer);
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || "Internal server error" });
        }
        logger_1.logger.error("Error en /generate-pdf:", error);
    }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    logger_1.logger.log(`Servidor PDF corriendo en puerto ${PORT}`);
});
