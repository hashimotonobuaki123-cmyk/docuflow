const UNSUPPORTED_ERROR_MESSAGE =
  "サポートされていないファイル形式です。PDF / DOC / DOCX のみ対応しています。";

/**
 * PDF / Word ファイルからテキストを抽出する共通ヘルパー。
 * - ファイルサイズチェックは呼び出し側で行う
 * - 対応形式:
 *   - .pdf  → pdf-parse
 *   - .doc / .docx → mammoth
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const filename = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (filename.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text ?? "").trim();
  }

  if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value ?? "").trim();
  }

  throw new Error(UNSUPPORTED_ERROR_MESSAGE);
}


