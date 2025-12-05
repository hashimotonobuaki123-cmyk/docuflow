import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock pdf-parse
vi.mock("pdf-parse", () => ({
  default: vi.fn().mockResolvedValue({ text: "PDF content extracted" }),
}));

// Mock mammoth
vi.mock("mammoth", () => ({
  extractRawText: vi.fn().mockResolvedValue({ value: "Word content extracted" }),
}));

// Since extractTextFromFile uses dynamic imports, we need to test it differently
describe("fileTextExtractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractTextFromFile", () => {
    it("should reject unsupported file types", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const unsupportedFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      await expect(extractTextFromFile(unsupportedFile)).rejects.toThrow(
        "サポートされていないファイル形式です"
      );
    });

    it("should reject image files", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const imageFile = new File(["content"], "image.png", {
        type: "image/png",
      });

      await expect(extractTextFromFile(imageFile)).rejects.toThrow(
        "サポートされていないファイル形式です"
      );
    });

    it("should reject executable files", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const exeFile = new File(["content"], "app.exe", {
        type: "application/octet-stream",
      });

      await expect(extractTextFromFile(exeFile)).rejects.toThrow(
        "サポートされていないファイル形式です"
      );
    });

    it("should handle uppercase file extensions", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      // Create a mock PDF file with uppercase extension
      const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // PDF magic bytes
      const pdfFile = new File([pdfContent], "TEST.PDF", {
        type: "application/pdf",
      });

      // Should not throw for valid PDF extension
      const result = await extractTextFromFile(pdfFile);
      expect(typeof result).toBe("string");
    });

    it("should handle files with multiple dots in name", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      const pdfFile = new File([pdfContent], "report.2024.01.pdf", {
        type: "application/pdf",
      });

      const result = await extractTextFromFile(pdfFile);
      expect(typeof result).toBe("string");
    });
  });

  describe("file type detection", () => {
    it("should accept .pdf files", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      const pdfFile = new File([pdfContent], "document.pdf", {
        type: "application/pdf",
      });

      const result = await extractTextFromFile(pdfFile);
      expect(typeof result).toBe("string");
    });

    it("should accept .doc files", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const docContent = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]); // DOC magic bytes
      const docFile = new File([docContent], "document.doc", {
        type: "application/msword",
      });

      const result = await extractTextFromFile(docFile);
      expect(typeof result).toBe("string");
    });

    it("should accept .docx files", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const docxContent = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // DOCX (ZIP) magic bytes
      const docxFile = new File([docxContent], "document.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const result = await extractTextFromFile(docxFile);
      expect(typeof result).toBe("string");
    });
  });

  describe("error handling", () => {
    it("should handle empty file name gracefully", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const emptyNameFile = new File(["content"], "", {
        type: "application/pdf",
      });

      await expect(extractTextFromFile(emptyNameFile)).rejects.toThrow();
    });

    it("should handle null-like file content", async () => {
      const { extractTextFromFile } = await import("../lib/fileTextExtractor");

      const emptyFile = new File([], "empty.pdf", {
        type: "application/pdf",
      });

      // Should attempt to parse even empty files
      const result = await extractTextFromFile(emptyFile);
      expect(typeof result).toBe("string");
    });
  });
});

describe("UNSUPPORTED_ERROR_MESSAGE", () => {
  it("should contain helpful error message", async () => {
    const { extractTextFromFile } = await import("../lib/fileTextExtractor");

    const txtFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });

    try {
      await extractTextFromFile(txtFile);
    } catch (error) {
      expect((error as Error).message).toContain("PDF");
      expect((error as Error).message).toContain("DOC");
      expect((error as Error).message).toContain("DOCX");
    }
  });
});

