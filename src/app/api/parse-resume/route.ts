import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import mammoth from "mammoth";

export async function POST(req: Request) {
    console.log("--> Parsing API hit");

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file uploaded" },
                { status: 400 },
            );
        }

        console.log(`Processing file: ${file.name} (${file.type})`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let text = "";

        // --- PDF HANDLING (Using pdf2json) ---
        if (file.type === "application/pdf") {
            console.log("Parsing PDF with pdf2json...");

            const parser = new PDFParser(null, true); // 1 = Text extraction only

            text = await new Promise((resolve, reject) => {
                parser.on("pdfParser_dataError", (errData: any) => {
                    console.error("PDF Parser Error:", errData.parserError);
                    reject(new Error(errData.parserError));
                });

                parser.on("pdfParser_dataReady", () => {
                    // getRawTextContent() returns the text from the PDF
                    const rawText = parser.getRawTextContent();
                    resolve(rawText);
                });

                parser.parseBuffer(buffer);
            });
            console.log("PDF parsed successfully");
        }
        // --- DOCX HANDLING (Using mammoth) ---
        else if (
            file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            console.log("Parsing DOCX...");
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json(
                {
                    message:
                        "Unsupported file type. Please upload PDF or DOCX.",
                },
                { status: 400 },
            );
        }

        // --- CLEANUP ---
        // pdf2json can sometimes leave URL-encoded artifacts (like %20 or dashes)
        // We do a quick decode and whitespace cleanup.
        if (text.includes("%20") || text.includes("%0A")) {
            try {
                text = decodeURIComponent(text);
            } catch (e) {
                // If it fails, it's likely just a random % symbol, so we ignore it.
            }
        }

        const cleanText = text.replace(/\n\s*\n/g, "\n\n").trim();

        return NextResponse.json({ text: cleanText }, { status: 200 });
    } catch (error) {
        console.error("Resume parse error:", error);
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Server Error",
            },
            { status: 500 },
        );
    }
}
