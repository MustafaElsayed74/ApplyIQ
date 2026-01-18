"use server"

export async function extractTextFromPDF(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { extractText } = await import("unpdf")
    const result = await extractText(uint8Array)

    let extractedText = ""
    if (Array.isArray(result.text)) {
      extractedText = result.text.join("\n")
    } else if (typeof result.text === "string") {
      extractedText = result.text
    } else {
      extractedText = String(result.text || "")
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return { error: "Could not extract text from PDF. The file might be image-based or empty." }
    }

    return { text: extractedText.trim() }
  } catch (error) {
    console.error("[v0] PDF parsing error:", error)
    return { error: "Failed to parse PDF file. Please ensure it's a valid PDF document." }
  }
}
