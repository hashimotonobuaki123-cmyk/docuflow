import { describe, it, expect } from "vitest";
import { t, getLocaleFromParam, type Locale } from "../lib/i18n";

describe("lib/i18n", () => {
  describe("getLocaleFromParam", () => {
    it("should return 'en' when lang param is provided", () => {
      expect(getLocaleFromParam("en")).toBe("en");
    });

    it("should return 'en' for any non-empty lang value", () => {
      expect(getLocaleFromParam("ja")).toBe("en");
      expect(getLocaleFromParam("fr")).toBe("en");
      expect(getLocaleFromParam("anything")).toBe("en");
    });

    it("should return 'ja' when lang param is undefined", () => {
      expect(getLocaleFromParam(undefined)).toBe("ja");
    });

    it("should return 'ja' when lang param is empty string", () => {
      expect(getLocaleFromParam("")).toBe("ja");
    });
  });

  describe("t (translation function)", () => {
    it("should return Japanese translation when locale is 'ja'", () => {
      const locale: Locale = "ja";
      expect(t(locale, "login")).toBe("ログイン");
      expect(t(locale, "signup")).toBe("アカウント作成");
      expect(t(locale, "dashboard")).toBe("ダッシュボード");
    });

    it("should return English translation when locale is 'en'", () => {
      const locale: Locale = "en";
      expect(t(locale, "login")).toBe("Log in");
      expect(t(locale, "signup")).toBe("Sign up");
      expect(t(locale, "dashboard")).toBe("Dashboard");
    });

    it("should return common UI strings correctly", () => {
      expect(t("ja", "settings")).toBe("設定");
      expect(t("en", "settings")).toBe("Settings");
      
      expect(t("ja", "newDocument")).toBe("新規作成");
      expect(t("en", "newDocument")).toBe("New Document");
      
      expect(t("ja", "archived")).toBe("アーカイブ");
      expect(t("en", "archived")).toBe("Archived");
    });

    it("should return document-related strings correctly", () => {
      expect(t("ja", "totalDocuments")).toBe("ドキュメント総数");
      expect(t("en", "totalDocuments")).toBe("Total Documents");
      
      expect(t("ja", "pinned")).toBe("ピン留め");
      expect(t("en", "pinned")).toBe("Pinned");
      
      expect(t("ja", "favorites")).toBe("お気に入り");
      expect(t("en", "favorites")).toBe("Favorites");
    });

    it("should return status strings correctly", () => {
      expect(t("ja", "statusOk")).toBe("稼働中");
      expect(t("en", "statusOk")).toBe("Operational");
      
      expect(t("ja", "docs")).toBe("件");
      expect(t("en", "docs")).toBe("");
    });

    it("should handle filter and search strings", () => {
      expect(t("ja", "filterAll")).toBe("すべて");
      expect(t("en", "filterAll")).toBe("All");
      
      expect(t("ja", "last30Days")).toBe("直近30日");
      expect(t("en", "last30Days")).toBe("Last 30 Days");
    });

    it("should return the key for unknown translation keys", () => {
      // @ts-expect-error - Testing invalid key behavior
      const result = t("ja", "unknownKey");
      expect(result).toBe("unknownKey");
    });
  });
});

