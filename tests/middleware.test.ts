import { describe, expect, it } from "vitest";
import {
  isProtectedPath,
  PROTECTED_PATHS,
  AUTH_COOKIE,
} from "../middleware";

describe("middleware", () => {
  describe("isProtectedPath", () => {
    it("保護されたパスを正しく判定する", () => {
      expect(isProtectedPath("/app")).toBe(true);
      expect(isProtectedPath("/app/dashboard")).toBe(true);
      expect(isProtectedPath("/new")).toBe(true);
      expect(isProtectedPath("/documents")).toBe(true);
      expect(isProtectedPath("/documents/123")).toBe(true);
      expect(isProtectedPath("/documents/123/edit")).toBe(true);
      expect(isProtectedPath("/settings")).toBe(true);
    });

    it("保護されていないパスを正しく判定する", () => {
      expect(isProtectedPath("/")).toBe(false);
      expect(isProtectedPath("/auth/login")).toBe(false);
      expect(isProtectedPath("/auth/signup")).toBe(false);
      expect(isProtectedPath("/auth/logout")).toBe(false);
      expect(isProtectedPath("/share/abc123")).toBe(false);
    });

    it("類似パスを保護パスとして誤判定しない", () => {
      // /app で始まらないが似ている名前
      expect(isProtectedPath("/application")).toBe(false);
      expect(isProtectedPath("/newer")).toBe(false);
      expect(isProtectedPath("/documentation")).toBe(false);
      expect(isProtectedPath("/setting")).toBe(false);
    });

    it("空文字やルートパスを正しく処理する", () => {
      expect(isProtectedPath("")).toBe(false);
      expect(isProtectedPath("/")).toBe(false);
    });
  });

  describe("定数", () => {
    it("PROTECTED_PATHSが正しく定義されている", () => {
      expect(PROTECTED_PATHS).toContain("/app");
      expect(PROTECTED_PATHS).toContain("/new");
      expect(PROTECTED_PATHS).toContain("/documents");
      expect(PROTECTED_PATHS).toContain("/settings");
    });

    it("AUTH_COOKIEが正しく定義されている", () => {
      expect(AUTH_COOKIE).toBe("docuhub_ai_auth");
    });
  });
});







