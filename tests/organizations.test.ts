import { describe, expect, it } from "vitest";
import {
  getRoleDisplayName,
  getRoleBadgeClass,
  canManageMembers,
  canDeleteOrganization,
  type OrganizationRole,
} from "../lib/organizationTypes";

describe("organizationTypes", () => {
  describe("getRoleDisplayName", () => {
    it("returns 'Owner' for owner role", () => {
      expect(getRoleDisplayName("owner")).toBe("Owner");
    });

    it("returns 'Admin' for admin role", () => {
      expect(getRoleDisplayName("admin")).toBe("Admin");
    });

    it("returns 'Member' for member role", () => {
      expect(getRoleDisplayName("member")).toBe("Member");
    });

    it("returns the role string for unknown roles", () => {
      expect(getRoleDisplayName("unknown" as OrganizationRole)).toBe("unknown");
    });
  });

  describe("getRoleBadgeClass", () => {
    it("returns emerald classes for owner", () => {
      const classes = getRoleBadgeClass("owner");
      expect(classes).toContain("emerald");
    });

    it("returns blue classes for admin", () => {
      const classes = getRoleBadgeClass("admin");
      expect(classes).toContain("blue");
    });

    it("returns slate classes for member", () => {
      const classes = getRoleBadgeClass("member");
      expect(classes).toContain("slate");
    });
  });

  describe("canManageMembers", () => {
    it("returns true for owner", () => {
      expect(canManageMembers("owner")).toBe(true);
    });

    it("returns true for admin", () => {
      expect(canManageMembers("admin")).toBe(true);
    });

    it("returns false for member", () => {
      expect(canManageMembers("member")).toBe(false);
    });
  });

  describe("canDeleteOrganization", () => {
    it("returns true for owner", () => {
      expect(canDeleteOrganization("owner")).toBe(true);
    });

    it("returns false for admin", () => {
      expect(canDeleteOrganization("admin")).toBe(false);
    });

    it("returns false for member", () => {
      expect(canDeleteOrganization("member")).toBe(false);
    });
  });
});
