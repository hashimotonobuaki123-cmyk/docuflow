import { describe, it, expect } from "vitest";
import { t, getLocaleFromParam, type Locale } from "../lib/i18n";

describe("lib/i18n", () => {
  describe("getLocaleFromParam", () => {
    it("should always return 'ja' (Japanese-only mode)", () => {
      expect(getLocaleFromParam(undefined)).toBe("ja");
      expect(getLocaleFromParam("")).toBe("ja");
      expect(getLocaleFromParam("en")).toBe("ja");
      expect(getLocaleFromParam("ja")).toBe("ja");
      expect(getLocaleFromParam("anything")).toBe("ja");
    });
  });

  describe("t (translation function)", () => {
    it("should return Japanese translation (Japanese-only mode)", () => {
      const locale: Locale = "ja";
      expect(t(locale, "login")).toBe("ログイン");
      expect(t(locale, "signup")).toBe("アカウント作成");
      expect(t(locale, "dashboard")).toBe("ダッシュボード");
    });

    it("should return common UI strings correctly", () => {
      expect(t("ja", "settings")).toBe("設定");
      
      expect(t("ja", "newDocument")).toBe("新規作成");
      
      expect(t("ja", "archived")).toBe("アーカイブ");
    });

    it("should return document-related strings correctly", () => {
      expect(t("ja", "totalDocuments")).toBe("ドキュメント総数");
      
      expect(t("ja", "pinned")).toBe("ピン留め");
      
      expect(t("ja", "favorites")).toBe("お気に入り");
    });

    it("should return status strings correctly", () => {
      expect(t("ja", "statusOk")).toBe("稼働中");
      
      expect(t("ja", "docs")).toBe("件");
    });

    it("should handle filter and search strings", () => {
      expect(t("ja", "filterAll")).toBe("すべて");
      
      expect(t("ja", "last30Days")).toBe("直近30日");
    });

    it("should return the key for unknown translation keys", () => {
      // @ts-expect-error - Testing invalid key behavior
      const result = t("ja", "unknownKey");
      expect(result).toBe("unknownKey");
    });
  });
});

