const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({ origin: allowedOrigins }));
app.use(express_1.default.json({ limit: "20mb" }));
app.post("/generate-pdf", async (req, res) => {
    // Logging completo para depuración:
    console.log("HEADERS:", req.headers);
    console.log("REQ.BODY:", req.body);
    console.log("Tipo recibido:", typeof req.body.html);
    console.log("Largo recibido:", req.body.html?.length);
    console.log("Preview recibido:", req.body.html?.slice(0, 200));
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
        console.error("Error en /generate-pdf:", error);
    }
});