/**
 * Database Types for DocuFlow
 *
 * These types represent the structure of data in the Supabase PostgreSQL database.
 * They provide type safety for all database operations.
 */

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  category: string | null;
  raw_content: string | null;
  summary: string | null;
  tags: string[] | null;
  share_token: string | null;
  is_archived: boolean;
  is_favorite: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  embedding: number[] | null; // pgvector embedding for semantic search
}

export type DocumentInsert = Omit<Document, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DocumentUpdate = Partial<DocumentInsert>;

// ============================================================================
// Organization Types
// ============================================================================

export type OrganizationPlan = "free" | "pro" | "team" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  seat_limit: number | null;
  document_limit: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_email: string | null;
  created_at: string;
}

export type OrganizationRole = "owner" | "admin" | "member";

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
}

// ============================================================================
// Version History Types
// ============================================================================

export interface DocumentVersion {
  id: string;
  document_id: string;
  title: string;
  category: string | null;
  raw_content: string | null;
  summary: string | null;
  tags: string[] | null;
  version_number: number;
  created_at: string;
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | "comment_added"
  | "comment_mention"
  | "share_link_created"
  | "document_shared"
  | "org_invitation"
  | "org_member_joined"
  | "document_updated";

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  document_id: string | null;
  comment_id: string | null;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ============================================================================
// Activity Log Types
// ============================================================================

export type ActivityAction =
  | "create_document"
  | "update_document"
  | "delete_document"
  | "archive_document"
  | "unarchive_document"
  | "share_document"
  | "unshare_document"
  | "add_comment"
  | "delete_comment"
  | "favorite_document"
  | "unfavorite_document"
  | "pin_document"
  | "unpin_document"
  | "join_organization"
  | "leave_organization"
  | "invite_member"
  | "remove_member";

export interface ActivityLog {
  id: string;
  user_id: string;
  organization_id: string | null;
  action: ActivityAction;
  document_id: string | null;
  document_title: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  archived?: boolean;
  favorite?: boolean;
  pinned?: boolean;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SemanticSearchResult {
  document: Document;
  similarity: number;
}

// ============================================================================
// AI Processing Types
// ============================================================================

export interface AiSummaryResult {
  title: string;
  summary: string;
  tags: string[];
  tokensUsed: number;
}

export interface AiProcessingOptions {
  generateTitle?: boolean;
  generateSummary?: boolean;
  generateTags?: boolean;
  maxTags?: number;
}

// ============================================================================
// Billing Types
// ============================================================================

export interface BillingInfo {
  plan: OrganizationPlan;
  seatLimit: number | null;
  documentLimit: number | null;
  currentSeats: number;
  currentDocuments: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  billingEmail: string | null;
}

export interface UsageMetrics {
  documentCount: number;
  memberCount: number;
  activityCount: number;
  storageUsedMb: number;
}

