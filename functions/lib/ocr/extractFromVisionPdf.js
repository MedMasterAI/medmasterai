import { ImageAnnotatorClient } from "@google-cloud/vision";
import { join } from "path";
import "../vision/config.js";
process.env.GOOGLE_APPLICATION_CREDENTIALS = join(process.cwd(), "lib/credentials/vision-service-account.json");
export async function extractFromVisionBuffer(buffer) {
    const client = new ImageAnnotatorClient();
    const [result] = await client.documentTextDetection({ image: { content: buffer } });
    return result.fullTextAnnotation?.text?.trim() || "";
}
//# sourceMappingURL=extractFromVisionPdf.js.map