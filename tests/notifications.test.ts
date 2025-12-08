import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime, extractMentions, getNotificationIcon, getNotificationBadgeClass } from "../lib/notifications";

describe("notifications", () => {
  describe("formatRelativeTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns 'Just now' for times within 1 minute (en)", () => {
      const date = "2024-01-15T11:59:30Z";
      expect(formatRelativeTime(date, "en")).toBe("Just now");
    });

    it("returns 'たった今' for times within 1 minute (ja)", () => {
      const date = "2024-01-15T11:59:30Z";
      expect(formatRelativeTime(date, "ja")).toBe("たった今");
    });

    it("returns minutes ago for times within 1 hour (en)", () => {
      const date = "2024-01-15T11:30:00Z";
      expect(formatRelativeTime(date, "en")).toBe("30 min ago");
    });

    it("returns minutes ago for times within 1 hour (ja)", () => {
      const date = "2024-01-15T11:30:00Z";
      expect(formatRelativeTime(date, "ja")).toBe("30分前");
    });

    it("returns hours ago for times within 1 day (en)", () => {
      const date = "2024-01-15T06:00:00Z";
      expect(formatRelativeTime(date, "en")).toBe("6 hours ago");
    });

    it("returns hours ago for times within 1 day (ja)", () => {
      const date = "2024-01-15T06:00:00Z";
      expect(formatRelativeTime(date, "ja")).toBe("6時間前");
    });

    it("returns days ago for times within 1 week (en)", () => {
      const date = "2024-01-12T12:00:00Z";
      expect(formatRelativeTime(date, "en")).toBe("3 days ago");
    });

    it("returns days ago for times within 1 week (ja)", () => {
      const date = "2024-01-12T12:00:00Z";
      expect(formatRelativeTime(date, "ja")).toBe("3日前");
    });
  });

  describe("extractMentions", () => {
    it("extracts email mentions", () => {
      const content = "Hey @user@example.com, check this out!";
      expect(extractMentions(content)).toEqual(["user@example.com"]);
    });

    it("extracts multiple mentions", () => {
      const content = "@alice and @bob should review this";
      expect(extractMentions(content)).toEqual(["alice", "bob"]);
    });

    it("returns empty array when no mentions", () => {
      const content = "No mentions here";
      expect(extractMentions(content)).toEqual([]);
    });

    it("handles mixed mentions", () => {
      const content = "@user1 and @admin@company.com need to see this";
      expect(extractMentions(content)).toEqual(["user1", "admin@company.com"]);
    });
  });

  describe("getNotificationIcon", () => {
    it("returns comment icon for comment_added", () => {
      expect(getNotificationIcon("comment_added")).toBe("💬");
    });

    it("returns megaphone icon for comment_mention", () => {
      expect(getNotificationIcon("comment_mention")).toBe("📢");
    });

    it("returns link icon for share_link_created", () => {
      expect(getNotificationIcon("share_link_created")).toBe("🔗");
    });

    it("returns bell icon for unknown types", () => {
      // @ts-expect-error - testing unknown type
      expect(getNotificationIcon("unknown")).toBe("🔔");
    });
  });

  describe("getNotificationBadgeClass", () => {
    it("returns sky classes for comment types", () => {
      const classes = getNotificationBadgeClass("comment_added");
      expect(classes).toContain("sky");
    });

    it("returns emerald classes for share types", () => {
      const classes = getNotificationBadgeClass("share_link_created");
      expect(classes).toContain("emerald");
    });

    it("returns violet classes for org types", () => {
      const classes = getNotificationBadgeClass("org_invitation");
      expect(classes).toContain("violet");
    });
  });
});
