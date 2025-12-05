import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock supabase client
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe("activityLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should not log activity if user is not authenticated", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      // Mock no user cookie
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      await logActivity("create_document", { documentId: "doc-1" });

      // Should not call supabase insert
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("should log activity for authenticated user", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      // Mock user cookie
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "user-123" }),
      } as any);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      await logActivity("create_document", {
        documentId: "doc-1",
        documentTitle: "Test Document",
      });

      expect(supabase.from).toHaveBeenCalledWith("activity_logs");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        action: "create_document",
        document_id: "doc-1",
        document_title: "Test Document",
        metadata: null,
      });
    });

    it("should include metadata details when provided", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "user-123" }),
      } as any);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      await logActivity("update_document", {
        documentId: "doc-1",
        details: "Updated title and content",
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { details: "Updated title and content" },
        })
      );
    });

    it("should handle all activity action types", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "user-123" }),
      } as any);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      const actions = [
        "create_document",
        "update_document",
        "delete_document",
        "archive_document",
        "restore_document",
        "toggle_favorite",
        "toggle_pinned",
        "enable_share",
        "disable_share",
        "add_comment",
      ] as const;

      for (const action of actions) {
        await logActivity(action, { documentId: "doc-1" });
      }

      expect(mockInsert).toHaveBeenCalledTimes(actions.length);
    });

    it("should handle empty payload", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "user-123" }),
      } as any);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      await logActivity("create_document");

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        action: "create_document",
        document_id: null,
        document_title: null,
        metadata: null,
      });
    });

    it("should handle null document title", async () => {
      const { cookies } = await import("next/headers");
      const { supabase } = await import("@/lib/supabaseClient");

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "user-123" }),
      } as any);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      const { logActivity } = await import("../lib/activityLog");

      await logActivity("create_document", {
        documentId: "doc-1",
        documentTitle: null,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          document_title: null,
        })
      );
    });
  });
});

