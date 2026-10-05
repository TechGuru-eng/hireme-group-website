import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const advertisingOrders = sqliteTable("advertising_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email").notNull().default(""),
  category: text("category").notNull(),
  durationDays: integer("duration_days").notNull(),
  posterDesign: integer("poster_design", { mode: "boolean" })
    .notNull()
    .default(false),
  flyerKey: text("flyer_key").notNull().default(""),
  flyerName: text("flyer_name").notNull().default(""),
  flyerType: text("flyer_type").notNull().default(""),
  copywriting: integer("copywriting", { mode: "boolean" })
    .notNull()
    .default(false),
  advertisingText: text("advertising_text").notNull().default(""),
  message: text("message").notNull(),
  ctaType: text("cta_type").notNull().default(""),
  ctaDestination: text("cta_destination").notNull().default(""),
  trackingToken: text("tracking_token").notNull().default(""),
  clickCount: integer("click_count").notNull().default(0),
  uniqueClickCount: integer("unique_click_count").notNull().default(0),
  lastClickedAt: text("last_clicked_at").notNull().default(""),
  totalXaf: integer("total_xaf").notNull(),
  accountId: integer("account_id").notNull().default(0),
  subtotalXaf: integer("subtotal_xaf").notNull().default(0),
  couponId: integer("coupon_id").notNull().default(0),
  couponCode: text("coupon_code").notNull().default(""),
  couponDiscountXaf: integer("coupon_discount_xaf").notNull().default(0),
  loyaltyDiscountXaf: integer("loyalty_discount_xaf").notNull().default(0),
  couponConsumed: integer("coupon_consumed", { mode: "boolean" })
    .notNull()
    .default(false),
  campaignStart: text("campaign_start").notNull().default(""),
  campaignEnd: text("campaign_end").notNull().default(""),
  paymentMethod: text("payment_method").notNull().default(""),
  paymentProofKey: text("payment_proof_key").notNull().default(""),
  paymentProofName: text("payment_proof_name").notNull().default(""),
  paymentProofType: text("payment_proof_type").notNull().default(""),
  paymentSubmittedAt: text("payment_submitted_at").notNull().default(""),
  status: text("status").notNull().default("pending_payment"),
  adminNotes: text("admin_notes").notNull().default(""),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const advertisingClicks = sqliteTable("advertising_clicks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  visitorHash: text("visitor_hash").notNull(),
  referrer: text("referrer").notNull().default(""),
  clickedAt: text("clicked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_advertising_clicks_order_visitor").on(table.orderId, table.visitorHash),
  index("idx_advertising_clicks_order").on(table.orderId),
]);

export const customerAccounts = sqliteTable("customer_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  whatsappNormalized: text("whatsapp_normalized").notNull().unique(),
  email: text("email").notNull().default(""),
  accessTokenHash: text("access_token_hash").notNull().unique(),
  completedOrders: integer("completed_orders").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses").notNull().default(0),
  usageCount: integer("usage_count").notNull().default(0),
  expiresAt: text("expires_at").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const emailMarketingOrders = sqliteTable("email_marketing_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  accountId: integer("account_id").notNull().default(0),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email").notNull().default(""),
  campaignType: text("campaign_type").notNull(),
  audienceSegment: text("audience_segment").notNull(),
  objective: text("objective").notNull(),
  emailSubject: text("email_subject").notNull().default(""),
  contentMode: text("content_mode").notNull(),
  emailContent: text("email_content").notNull().default(""),
  brief: text("brief").notNull().default(""),
  landingUrl: text("landing_url").notNull().default(""),
  attachmentKey: text("attachment_key").notNull().default(""),
  attachmentName: text("attachment_name").notNull().default(""),
  attachmentType: text("attachment_type").notNull().default(""),
  durationDays: integer("duration_days").notNull().default(2),
  contactCount: integer("contact_count").notNull().default(2000),
  totalXaf: integer("total_xaf").notNull().default(10000),
  status: text("status").notNull().default("pending_payment"),
  paymentMethod: text("payment_method").notNull().default(""),
  paymentProofKey: text("payment_proof_key").notNull().default(""),
  paymentProofName: text("payment_proof_name").notNull().default(""),
  paymentProofType: text("payment_proof_type").notNull().default(""),
  paymentSubmittedAt: text("payment_submitted_at").notNull().default(""),
  campaignStart: text("campaign_start").notNull().default(""),
  campaignEnd: text("campaign_end").notNull().default(""),
  adminNotes: text("admin_notes").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
