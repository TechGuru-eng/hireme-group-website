/** Cloudflare Worker entry point for HireMe. */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BUCKET: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: {
          format: string;
          quality: number;
        }): Promise<{ response(): Response }>;
      };
    };
  };
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const adminEmails = new Set(["ndintekhandson@gmail.com"]);
const allowedStatuses = new Set([
  "new",
  "pending_payment",
  "payment_submitted",
  "paid",
  "active",
  "completed",
  "rejected",
]);
const paidStatuses = new Set(["paid", "active", "completed"]);
const clean = (value: FormDataEntryValue | null, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const isAdmin = (request: Request) =>
  adminEmails.has(
    request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() ??
      "",
  );
const normalizeWhatsapp = (value: string) =>
  value.replace(/\D/g, "").replace(/^00/, "");
function normalizeCta(type: string, value: string): string | null {
  if (type === "whatsapp") {
    let number = normalizeWhatsapp(value);
    if (number.length === 9 && number.startsWith("6")) number = `237${number}`;
    return number.length >= 8 && number.length <= 15
      ? `https://wa.me/${number}`
      : null;
  }
  if (type === "website") {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(candidate);
      return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
    } catch {
      return null;
    }
  }
  return null;
}
const round500 = (value: number) =>
  Math.max(500, Math.round(value / 500) * 500);

function campaignPrice(days: number): number {
  const d = Math.min(90, Math.max(1, Math.round(days)));
  if (d === 1) return 2500;
  if (d <= 7) return round500(2500 + (d - 1) * 1250);
  if (d <= 15) return round500(10000 + (d - 7) * 1125);
  if (d <= 30) return round500(19000 + (d - 15) * (11000 / 15));
  return round500(30000 + (d - 30) * 900);
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
async function tokenHash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

type Coupon = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number;
  usageCount: number;
  expiresAt: string;
  active: number;
};
async function validCoupon(env: Env, code: string): Promise<Coupon | null> {
  if (!code) return null;
  const row = await env.DB.prepare(
    "SELECT id, code, discount_type AS discountType, discount_value AS discountValue, max_uses AS maxUses, usage_count AS usageCount, expires_at AS expiresAt, active FROM coupons WHERE code = ?",
  )
    .bind(code.toUpperCase())
    .first<Coupon>();
  if (
    !row ||
    !row.active ||
    (row.maxUses > 0 && row.usageCount >= row.maxUses) ||
    (row.expiresAt && row.expiresAt < new Date().toISOString().slice(0, 10))
  )
    return null;
  return row;
}
function couponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  const amount =
    coupon.discountType === "percent"
      ? (subtotal * Math.min(80, coupon.discountValue)) / 100
      : coupon.discountValue;
  return Math.min(subtotal - 500, round500(amount));
}

async function createAdvertisingOrder(
  request: Request,
  env: Env,
): Promise<Response> {
  let uploadedKey = "";
  try {
    const body = await request.formData();
    if (clean(body.get("website"), 200))
      return Response.json({ ok: true }, { status: 201 });
    const customerName = clean(body.get("customerName"), 100);
    const businessName = clean(body.get("businessName"), 140);
    const whatsapp = clean(body.get("whatsapp"), 40).replace(
      /[^+\d\s()-]/g,
      "",
    );
    const whatsappNormalized = normalizeWhatsapp(whatsapp);
    const email = clean(body.get("email"), 160);
    const category = clean(body.get("category"), 80);
    const message = clean(body.get("message"), 2000);
    const advertisingText = clean(body.get("advertisingText"), 2500);
    const ctaType = clean(body.get("ctaType"), 20).toLowerCase();
    const ctaDestination = normalizeCta(
      ctaType,
      clean(body.get("ctaDestination"), 500),
    );
    const durationDays = Number(clean(body.get("durationDays"), 3));
    const posterDesign = clean(body.get("posterDesign"), 8) === "true";
    const copywriting = clean(body.get("copywriting"), 8) === "true";
    const requestedCoupon = clean(body.get("couponCode"), 40)
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");
    if (
      !customerName ||
      !businessName ||
      whatsappNormalized.length < 8 ||
      !category ||
      !ctaDestination ||
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 90
    )
      return Response.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 },
      );
    if (!copywriting && !advertisingText)
      return Response.json(
        {
          error:
            "Veuillez fournir votre texte publicitaire ou choisir le service de rédaction.",
        },
        { status: 400 },
      );
    if (copywriting && !message)
      return Response.json(
        {
          error:
            "Veuillez fournir les informations nécessaires à la rédaction.",
        },
        { status: 400 },
      );

    const flyer = body.get("flyer");
    let flyerName = "";
    let flyerType = "";
    if (!posterDesign) {
      if (!(flyer instanceof File) || flyer.size === 0)
        return Response.json(
          { error: "Veuillez joindre votre affiche publicitaire." },
          { status: 400 },
        );
      const allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ]);
      if (!allowed.has(flyer.type) || flyer.size > 8 * 1024 * 1024)
        return Response.json(
          {
            error:
              "L’affiche doit être un fichier JPG, PNG, WEBP ou PDF de 8 Mo maximum.",
          },
          { status: 400 },
        );
      flyerName = flyer.name.slice(0, 180);
      flyerType = flyer.type;
      uploadedKey = `advertising-flyers/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
      await env.BUCKET.put(uploadedKey, flyer.stream(), {
        httpMetadata: {
          contentType: flyerType,
          contentDisposition: `inline; filename="${flyerName.replace(/["\\]/g, "")}"`,
        },
      });
    }

    const accessToken = randomToken();
    const accessTokenHash = await tokenHash(accessToken);
    let account = await env.DB.prepare(
      "SELECT id, completed_orders AS completedOrders FROM customer_accounts WHERE whatsapp_normalized = ?",
    )
      .bind(whatsappNormalized)
      .first<{ id: number; completedOrders: number }>();
    if (account) {
      await env.DB.prepare(
        "UPDATE customer_accounts SET customer_name=?, whatsapp=?, email=?, access_token_hash=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
        .bind(customerName, whatsapp, email, accessTokenHash, account.id)
        .run();
    } else {
      const inserted = await env.DB.prepare(
        "INSERT INTO customer_accounts (customer_name, whatsapp, whatsapp_normalized, email, access_token_hash) VALUES (?, ?, ?, ?, ?)",
      )
        .bind(
          customerName,
          whatsapp,
          whatsappNormalized,
          email,
          accessTokenHash,
        )
        .run();
      account = { id: Number(inserted.meta.last_row_id), completedOrders: 0 };
    }
    const subtotalXaf =
      campaignPrice(durationDays) +
      (posterDesign ? 4000 : 0) +
      (copywriting ? 1000 : 0);
    const coupon = await validCoupon(env, requestedCoupon);
    const couponDiscountXaf = couponDiscount(coupon, subtotalXaf);
    const loyaltyDiscountXaf =
      account.completedOrders >= 3
        ? round500((subtotalXaf - couponDiscountXaf) * 0.1)
        : 0;
    const totalXaf = Math.max(
      500,
      subtotalXaf - couponDiscountXaf - loyaltyDiscountXaf,
    );
    const reference = `HM-ADS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const trackingToken = crypto.randomUUID().replace(/-/g, "");
    await env.DB.prepare(
      `INSERT INTO advertising_orders (reference, customer_name, business_name, whatsapp, email, category, duration_days, poster_design, flyer_key, flyer_name, flyer_type, copywriting, advertising_text, message, cta_type, cta_destination, tracking_token, total_xaf, account_id, subtotal_xaf, coupon_id, coupon_code, coupon_discount_xaf, loyalty_discount_xaf, status, admin_notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', CURRENT_TIMESTAMP)`,
    )
      .bind(
        reference,
        customerName,
        businessName,
        whatsapp,
        email,
        category,
        durationDays,
        posterDesign ? 1 : 0,
        uploadedKey,
        flyerName,
        flyerType,
        copywriting ? 1 : 0,
        advertisingText,
        message,
        ctaType,
        ctaDestination,
        trackingToken,
        totalXaf,
        account.id,
        subtotalXaf,
        coupon?.id ?? 0,
        coupon?.code ?? "",
        couponDiscountXaf,
        loyaltyDiscountXaf,
        "new",
      )
      .run();
    return Response.json(
      {
        reference,
        totalXaf,
        subtotalXaf,
        couponDiscountXaf,
        loyaltyDiscountXaf,
        accountUrl: `/ads/account?key=${accessToken}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedKey)
      await env.BUCKET.delete(uploadedKey).catch(() => undefined);
    const detail = error instanceof Error ? error.message : "";
    return Response.json(
      {
        error:
          detail.includes("no such table") || detail.includes("no column")
            ? "Le réseau publicitaire est en cours d’activation. Réessayez dans quelques instants."
            : "Impossible d’enregistrer la commande pour le moment.",
      },
      { status: 500 },
    );
  }
}

async function validateCoupon(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as {
    code?: string;
    subtotalXaf?: number;
  };
  const code = String(body.code ?? "")
    .toUpperCase()
    .trim();
  const subtotal = Math.max(500, Number(body.subtotalXaf) || 0);
  const coupon = await validCoupon(env, code);
  if (!coupon)
    return Response.json(
      { error: "Code promo invalide, expiré ou épuisé." },
      { status: 404 },
    );
  return Response.json({
    code: coupon.code,
    discountXaf: couponDiscount(coupon, subtotal),
    label:
      coupon.discountType === "percent"
        ? `${coupon.discountValue}%`
        : `${coupon.discountValue.toLocaleString("fr-FR")} FCFA`,
  });
}

async function customerPortal(request: Request, env: Env): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (key.length !== 64)
    return Response.json({ error: "Lien d’accès invalide." }, { status: 401 });
  const hash = await tokenHash(key);
  const account = await env.DB.prepare(
    "SELECT id, customer_name AS customerName, whatsapp, email, completed_orders AS completedOrders, created_at AS createdAt FROM customer_accounts WHERE access_token_hash=?",
  )
    .bind(hash)
    .first<{
      id: number;
      customerName: string;
      whatsapp: string;
      email: string;
      completedOrders: number;
      createdAt: string;
    }>();
  if (!account)
    return Response.json(
      { error: "Lien d’accès invalide ou remplacé par un lien plus récent." },
      { status: 401 },
    );
  const orders = await env.DB.prepare(
    "SELECT reference, business_name AS businessName, category, duration_days AS durationDays, subtotal_xaf AS subtotalXaf, coupon_code AS couponCode, coupon_discount_xaf AS couponDiscountXaf, loyalty_discount_xaf AS loyaltyDiscountXaf, total_xaf AS totalXaf, cta_type AS ctaType, tracking_token AS trackingToken, click_count AS clickCount, unique_click_count AS uniqueClickCount, last_clicked_at AS lastClickedAt, status, payment_method AS paymentMethod, payment_submitted_at AS paymentSubmittedAt, campaign_start AS campaignStart, campaign_end AS campaignEnd, created_at AS createdAt, updated_at AS updatedAt FROM advertising_orders WHERE account_id=? ORDER BY id DESC",
  )
    .bind(account.id)
    .all();
  return Response.json({
    account,
    loyalty: {
      completed: account.completedOrders,
      target: 3,
      eligible: account.completedOrders >= 3,
      discountPercent: 10,
    },
    orders: orders.results,
  });
}

async function submitPaymentProof(
  request: Request,
  env: Env,
): Promise<Response> {
  let uploadedKey = "";
  try {
    const body = await request.formData(),
      key = clean(body.get("key"), 64),
      reference = clean(body.get("reference"), 80),
      method = clean(body.get("paymentMethod"), 20).toLowerCase();
    if (key.length !== 64 || !reference || !["mtn", "orange"].includes(method))
      return Response.json(
        { error: "Informations de paiement invalides." },
        { status: 400 },
      );
    const hash = await tokenHash(key),
      account = await env.DB.prepare(
        "SELECT id FROM customer_accounts WHERE access_token_hash=?",
      )
        .bind(hash)
        .first<{ id: number }>();
    if (!account)
      return Response.json(
        { error: "Votre lien privé n’est plus valide." },
        { status: 401 },
      );
    const order = await env.DB.prepare(
      "SELECT id, status, payment_proof_key AS proofKey FROM advertising_orders WHERE reference=? AND account_id=?",
    )
      .bind(reference, account.id)
      .first<{ id: number; status: string; proofKey: string }>();
    if (!order)
      return Response.json({ error: "Commande introuvable." }, { status: 404 });
    if (["paid", "active", "completed"].includes(order.status))
      return Response.json(
        { error: "Ce paiement a déjà été approuvé." },
        { status: 409 },
      );
    const proof = body.get("proof"),
      allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ]);
    if (
      !(proof instanceof File) ||
      proof.size === 0 ||
      !allowed.has(proof.type) ||
      proof.size > 8 * 1024 * 1024
    )
      return Response.json(
        { error: "Envoyez une capture JPG, PNG, WEBP ou PDF de 8 Mo maximum." },
        { status: 400 },
      );
    uploadedKey = `payment-proofs/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
    const safeName = proof.name.slice(0, 180).replace(/["\\]/g, "");
    await env.BUCKET.put(uploadedKey, proof.stream(), {
      httpMetadata: {
        contentType: proof.type,
        contentDisposition: `inline; filename="${safeName}"`,
      },
    });
    await env.DB.prepare(
      "UPDATE advertising_orders SET payment_method=?, payment_proof_key=?, payment_proof_name=?, payment_proof_type=?, payment_submitted_at=CURRENT_TIMESTAMP, status='payment_submitted', updated_at=CURRENT_TIMESTAMP WHERE id=?",
    )
      .bind(method, uploadedKey, safeName, proof.type, order.id)
      .run();
    if (order.proofKey && order.proofKey !== uploadedKey)
      await env.BUCKET.delete(order.proofKey).catch(() => undefined);
    return Response.json({ ok: true, status: "payment_submitted" });
  } catch {
    if (uploadedKey)
      await env.BUCKET.delete(uploadedKey).catch(() => undefined);
    return Response.json(
      { error: "Impossible d’envoyer le reçu pour le moment." },
      { status: 500 },
    );
  }
}

async function listOrders(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request))
    return Response.json({ error: "Accès non autorisé." }, { status: 403 });
  const result = await env.DB.prepare(
    `SELECT id, reference, customer_name AS customerName, business_name AS businessName, whatsapp, email, category, duration_days AS durationDays, poster_design AS posterDesign, flyer_name AS flyerName, copywriting, advertising_text AS advertisingText, message, cta_type AS ctaType, cta_destination AS ctaDestination, tracking_token AS trackingToken, click_count AS clickCount, unique_click_count AS uniqueClickCount, last_clicked_at AS lastClickedAt, subtotal_xaf AS subtotalXaf, coupon_code AS couponCode, coupon_discount_xaf AS couponDiscountXaf, loyalty_discount_xaf AS loyaltyDiscountXaf, total_xaf AS totalXaf, payment_method AS paymentMethod, payment_proof_name AS paymentProofName, payment_submitted_at AS paymentSubmittedAt, status, admin_notes AS adminNotes, campaign_start AS campaignStart, campaign_end AS campaignEnd, created_at AS createdAt, updated_at AS updatedAt FROM advertising_orders ORDER BY id DESC LIMIT 500`,
  ).all();
  return Response.json({ orders: result.results });
}

async function updateOrder(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request))
    return Response.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = (await request.json()) as {
    id?: number;
    status?: string;
    adminNotes?: string;
    campaignStart?: string;
    campaignEnd?: string;
    ctaType?: string;
    ctaDestination?: string;
  };
  const id = Number(body.id),
    status = String(body.status ?? ""),
    notes = String(body.adminNotes ?? "")
      .trim()
      .slice(0, 2000);
  const start = String(body.campaignStart ?? "").slice(0, 10),
    end = String(body.campaignEnd ?? "").slice(0, 10);
  const ctaType = String(body.ctaType ?? "").toLowerCase();
  const ctaDestination = normalizeCta(
    ctaType,
    String(body.ctaDestination ?? "").trim().slice(0, 500),
  );
  if (!Number.isInteger(id) || id < 1 || !allowedStatuses.has(status))
    return Response.json({ error: "Mise à jour invalide." }, { status: 400 });
  if (!ctaDestination)
    return Response.json({ error: "CTA invalide." }, { status: 400 });
  const old = await env.DB.prepare(
    "SELECT status, account_id AS accountId, coupon_id AS couponId, coupon_consumed AS couponConsumed, tracking_token AS trackingToken FROM advertising_orders WHERE id=?",
  )
    .bind(id)
    .first<{
      status: string;
      accountId: number;
      couponId: number;
      couponConsumed: number;
      trackingToken: string;
    }>();
  if (!old)
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  const statements = [
    env.DB.prepare(
      "UPDATE advertising_orders SET status=?, admin_notes=?, campaign_start=?, campaign_end=?, cta_type=?, cta_destination=?, tracking_token=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
    ).bind(status, notes, start, end, ctaType, ctaDestination, old.trackingToken || crypto.randomUUID().replace(/-/g, ""), id),
  ];
  if (old.status !== "completed" && status === "completed" && old.accountId)
    statements.push(
      env.DB.prepare(
        "UPDATE customer_accounts SET completed_orders=completed_orders+1, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      ).bind(old.accountId),
    );
  if (old.status === "completed" && status !== "completed" && old.accountId)
    statements.push(
      env.DB.prepare(
        "UPDATE customer_accounts SET completed_orders=MAX(0, completed_orders-1), updated_at=CURRENT_TIMESTAMP WHERE id=?",
      ).bind(old.accountId),
    );
  if (!old.couponConsumed && old.couponId && paidStatuses.has(status)) {
    statements.push(
      env.DB.prepare(
        "UPDATE coupons SET usage_count=usage_count+1 WHERE id=?",
      ).bind(old.couponId),
    );
    statements.push(
      env.DB.prepare(
        "UPDATE advertising_orders SET coupon_consumed=1 WHERE id=?",
      ).bind(id),
    );
  }
  await env.DB.batch(statements);
  return Response.json({ ok: true });
}

async function couponsAdmin(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request))
    return Response.json({ error: "Accès non autorisé." }, { status: 403 });
  if (request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id, code, discount_type AS discountType, discount_value AS discountValue, max_uses AS maxUses, usage_count AS usageCount, expires_at AS expiresAt, active, created_at AS createdAt FROM coupons ORDER BY id DESC",
    ).all();
    return Response.json({ coupons: rows.results });
  }
  const body = (await request.json()) as Record<string, unknown>;
  if (request.method === "POST") {
    const code = String(body.code ?? "")
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9_-]/g, "");
    const type = String(body.discountType ?? "percent");
    const value = Math.round(Number(body.discountValue));
    const maxUses = Math.max(0, Math.round(Number(body.maxUses) || 0));
    const expiresAt = String(body.expiresAt ?? "").slice(0, 10);
    if (
      code.length < 3 ||
      !["percent", "fixed"].includes(type) ||
      value < 1 ||
      (type === "percent" && value > 80)
    )
      return Response.json(
        { error: "Paramètres du coupon invalides." },
        { status: 400 },
      );
    try {
      await env.DB.prepare(
        "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at, active) VALUES (?, ?, ?, ?, ?, 1)",
      )
        .bind(code, type, value, maxUses, expiresAt)
        .run();
      return Response.json({ ok: true }, { status: 201 });
    } catch {
      return Response.json({ error: "Ce code existe déjà." }, { status: 409 });
    }
  }
  const id = Number(body.id),
    active = body.active ? 1 : 0;
  if (!Number.isInteger(id))
    return Response.json({ error: "Coupon invalide." }, { status: 400 });
  await env.DB.prepare("UPDATE coupons SET active=? WHERE id=?")
    .bind(active, id)
    .run();
  return Response.json({ ok: true });
}

async function flyer(
  request: Request,
  env: Env,
  id: number,
): Promise<Response> {
  if (!isAdmin(request))
    return Response.json({ error: "Accès non autorisé." }, { status: 403 });
  const row = await env.DB.prepare(
    "SELECT flyer_key AS flyerKey, flyer_name AS flyerName, flyer_type AS flyerType FROM advertising_orders WHERE id=?",
  )
    .bind(id)
    .first<{ flyerKey: string; flyerName: string; flyerType: string }>();
  if (!row?.flyerKey)
    return Response.json({ error: "Aucune affiche jointe." }, { status: 404 });
  const object = await env.BUCKET.get(row.flyerKey);
  if (!object)
    return Response.json({ error: "Fichier introuvable." }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", row.flyerType || "application/octet-stream");
  headers.set(
    "Content-Disposition",
    `inline; filename="${row.flyerName.replace(/["\\]/g, "")}"`,
  );
  headers.set("Cache-Control", "private, no-store");
  return new Response(object.body, { headers });
}

async function paymentProof(
  request: Request,
  env: Env,
  id: number,
): Promise<Response> {
  if (!isAdmin(request))
    return Response.json({ error: "Accès non autorisé." }, { status: 403 });
  const row = await env.DB.prepare(
    "SELECT payment_proof_key AS proofKey, payment_proof_name AS proofName, payment_proof_type AS proofType FROM advertising_orders WHERE id=?",
  )
    .bind(id)
    .first<{ proofKey: string; proofName: string; proofType: string }>();
  if (!row?.proofKey)
    return Response.json({ error: "Aucun reçu envoyé." }, { status: 404 });
  const object = await env.BUCKET.get(row.proofKey);
  if (!object)
    return Response.json({ error: "Reçu introuvable." }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", row.proofType || "application/octet-stream");
  headers.set(
    "Content-Disposition",
    `inline; filename="${row.proofName.replace(/["\\]/g, "")}"`,
  );
  headers.set("Cache-Control", "private, no-store");
  return new Response(object.body, { headers });
}

async function trackAdvertisingClick(
  request: Request,
  env: Env,
  token: string,
): Promise<Response> {
  const order = await env.DB.prepare(
    "SELECT id, cta_type AS ctaType, cta_destination AS destination FROM advertising_orders WHERE tracking_token=? AND cta_destination!=''",
  )
    .bind(token)
    .first<{ id: number; ctaType: string; destination: string }>();
  if (!order)
    return new Response("Lien publicitaire introuvable.", { status: 404 });
  const destination = normalizeCta(order.ctaType, order.destination);
  if (!destination)
    return new Response("Destination publicitaire invalide.", { status: 422 });
  if (destination !== order.destination)
    await env.DB.prepare("UPDATE advertising_orders SET cta_destination=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(destination, order.id)
      .run();
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const visitorHash = await tokenHash(`${order.id}|${ip}|${userAgent}`);
  const referrer = (request.headers.get("referer") ?? "").slice(0, 500);
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO advertising_clicks (order_id, visitor_hash, referrer) VALUES (?, ?, ?)",
  )
    .bind(order.id, visitorHash, referrer)
    .run();
  const isUnique = Number(inserted.meta.changes ?? 0);
  await env.DB.prepare(
    "UPDATE advertising_orders SET click_count=click_count+1, unique_click_count=unique_click_count+?, last_clicked_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?",
  )
    .bind(isUnique, order.id)
    .run();
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

const emailStatuses=new Set(["new","pending_payment","payment_submitted","paid","scheduled","active","completed","rejected"]);
async function emailAccount(env:Env,whatsappNormalized:string,customerName:string,whatsapp:string,email:string){const token=randomToken(),hash=await tokenHash(token);let account=await env.DB.prepare("SELECT id FROM customer_accounts WHERE whatsapp_normalized=?").bind(whatsappNormalized).first<{id:number}>();if(account)await env.DB.prepare("UPDATE customer_accounts SET customer_name=?,whatsapp=?,email=?,access_token_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(customerName,whatsapp,email,hash,account.id).run();else{const inserted=await env.DB.prepare("INSERT INTO customer_accounts (customer_name,whatsapp,whatsapp_normalized,email,access_token_hash) VALUES (?,?,?,?,?)").bind(customerName,whatsapp,whatsappNormalized,email,hash).run();account={id:Number(inserted.meta.last_row_id)}}return{account,token}}
async function createEmailOrder(request:Request,env:Env){let uploadKey="";try{const b=await request.formData();if(clean(b.get("website"),200))return Response.json({ok:true},{status:201});const customerName=clean(b.get("customerName"),100),businessName=clean(b.get("businessName"),140),whatsapp=clean(b.get("whatsapp"),40).replace(/[^+\d\s()-]/g,""),whatsappNormalized=normalizeWhatsapp(whatsapp),email=clean(b.get("email"),160),campaignType=clean(b.get("campaignType"),80),audienceSegment=clean(b.get("audienceSegment"),100),objective=clean(b.get("objective"),120),emailSubject=clean(b.get("emailSubject"),160),contentMode=clean(b.get("contentMode"),20),emailContent=clean(b.get("emailContent"),6000),brief=clean(b.get("brief"),4000),landingUrl=clean(b.get("landingUrl"),500);if(!customerName||!businessName||whatsappNormalized.length<8||!email.includes("@")||!campaignType||!audienceSegment||!objective||!["ready","brief"].includes(contentMode)||(contentMode==="ready"&&!emailContent)||(contentMode==="brief"&&!brief))return Response.json({error:"Veuillez compléter tous les champs obligatoires."},{status:400});const attachment=b.get("attachment");let attachmentName="",attachmentType="";if(attachment instanceof File&&attachment.size){const allowed=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);if(!allowed.has(attachment.type)||attachment.size>8*1024*1024)return Response.json({error:"La pièce jointe doit être un JPG, PNG, WEBP ou PDF de 8 Mo maximum."},{status:400});attachmentName=attachment.name.slice(0,180).replace(/["\\]/g,"");attachmentType=attachment.type;uploadKey=`email-marketing/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}`;await env.BUCKET.put(uploadKey,attachment.stream(),{httpMetadata:{contentType:attachmentType,contentDisposition:`inline; filename="${attachmentName}"`}})}const{account,token}=await emailAccount(env,whatsappNormalized,customerName,whatsapp,email);const reference=`HM-EMAIL-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,4).toUpperCase()}`;await env.DB.prepare("INSERT INTO email_marketing_orders (reference,account_id,customer_name,business_name,whatsapp,email,campaign_type,audience_segment,objective,email_subject,content_mode,email_content,brief,landing_url,attachment_key,attachment_name,attachment_type,duration_days,contact_count,total_xaf,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,2,2000,10000,'pending_payment')").bind(reference,account.id,customerName,businessName,whatsapp,email,campaignType,audienceSegment,objective,emailSubject,contentMode,emailContent,brief,landingUrl,uploadKey,attachmentName,attachmentType).run();return Response.json({reference,totalXaf:10000,accountUrl:`/email-marketing/account?key=${token}`},{status:201})}catch{if(uploadKey)await env.BUCKET.delete(uploadKey).catch(()=>undefined);return Response.json({error:"Impossible d’enregistrer la campagne pour le moment."},{status:500})}}
async function emailPortal(request:Request,env:Env){const key=new URL(request.url).searchParams.get("key")||"";if(key.length!==64)return Response.json({error:"Lien d’accès invalide."},{status:401});const hash=await tokenHash(key),account=await env.DB.prepare("SELECT id,customer_name AS customerName FROM customer_accounts WHERE access_token_hash=?").bind(hash).first<{id:number;customerName:string}>();if(!account)return Response.json({error:"Lien privé invalide ou remplacé."},{status:401});const rows=await env.DB.prepare("SELECT reference,business_name AS businessName,campaign_type AS campaignType,audience_segment AS audienceSegment,total_xaf AS totalXaf,status,payment_method AS paymentMethod,payment_submitted_at AS paymentSubmittedAt,campaign_start AS campaignStart,campaign_end AS campaignEnd,created_at AS createdAt FROM email_marketing_orders WHERE account_id=? ORDER BY id DESC").bind(account.id).all();return Response.json({account,orders:rows.results})}
async function emailPayment(request:Request,env:Env){let proofKey="";try{const b=await request.formData(),key=clean(b.get("key"),64),reference=clean(b.get("reference"),80),method=clean(b.get("paymentMethod"),20);if(key.length!==64||!["mtn","orange"].includes(method))return Response.json({error:"Informations de paiement invalides."},{status:400});const hash=await tokenHash(key),account=await env.DB.prepare("SELECT id FROM customer_accounts WHERE access_token_hash=?").bind(hash).first<{id:number}>();if(!account)return Response.json({error:"Lien privé invalide."},{status:401});const order=await env.DB.prepare("SELECT id,status,payment_proof_key AS oldKey FROM email_marketing_orders WHERE reference=? AND account_id=?").bind(reference,account.id).first<{id:number;status:string;oldKey:string}>();if(!order)return Response.json({error:"Campagne introuvable."},{status:404});const proof=b.get("proof"),allowed=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);if(!(proof instanceof File)||!proof.size||!allowed.has(proof.type)||proof.size>8*1024*1024)return Response.json({error:"Envoyez un reçu JPG, PNG, WEBP ou PDF de 8 Mo maximum."},{status:400});const name=proof.name.slice(0,180).replace(/["\\]/g,"");proofKey=`email-payments/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}`;await env.BUCKET.put(proofKey,proof.stream(),{httpMetadata:{contentType:proof.type,contentDisposition:`inline; filename="${name}"`}});await env.DB.prepare("UPDATE email_marketing_orders SET payment_method=?,payment_proof_key=?,payment_proof_name=?,payment_proof_type=?,payment_submitted_at=CURRENT_TIMESTAMP,status='payment_submitted',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(method,proofKey,name,proof.type,order.id).run();if(order.oldKey)await env.BUCKET.delete(order.oldKey).catch(()=>undefined);return Response.json({ok:true})}catch{if(proofKey)await env.BUCKET.delete(proofKey).catch(()=>undefined);return Response.json({error:"Impossible d’envoyer le reçu."},{status:500})}}
async function emailAdmin(request:Request,env:Env){if(!isAdmin(request))return Response.json({error:"Accès non autorisé."},{status:403});if(request.method==="GET"){const rows=await env.DB.prepare("SELECT id,reference,customer_name AS customerName,business_name AS businessName,whatsapp,email,campaign_type AS campaignType,audience_segment AS audienceSegment,objective,email_subject AS emailSubject,content_mode AS contentMode,email_content AS emailContent,brief,landing_url AS landingUrl,attachment_name AS attachmentName,total_xaf AS totalXaf,status,payment_method AS paymentMethod,payment_proof_name AS paymentProofName,payment_submitted_at AS paymentSubmittedAt,campaign_start AS campaignStart,campaign_end AS campaignEnd,admin_notes AS adminNotes,created_at AS createdAt FROM email_marketing_orders ORDER BY id DESC LIMIT 500").all();return Response.json({orders:rows.results})}const b=await request.json() as{id?:number;status?:string;adminNotes?:string;campaignStart?:string;campaignEnd?:string};const id=Number(b.id),status=String(b.status||"");if(!Number.isInteger(id)||!emailStatuses.has(status))return Response.json({error:"Mise à jour invalide."},{status:400});await env.DB.prepare("UPDATE email_marketing_orders SET status=?,admin_notes=?,campaign_start=?,campaign_end=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,String(b.adminNotes||"").slice(0,2000),String(b.campaignStart||"").slice(0,10),String(b.campaignEnd||"").slice(0,10),id).run();return Response.json({ok:true})}
async function emailFile(request:Request,env:Env,id:number,kind:"attachment"|"payment"){if(!isAdmin(request))return Response.json({error:"Accès non autorisé."},{status:403});const cols=kind==="attachment"?"attachment_key AS fileKey,attachment_name AS fileName,attachment_type AS fileType":"payment_proof_key AS fileKey,payment_proof_name AS fileName,payment_proof_type AS fileType";const row=await env.DB.prepare(`SELECT ${cols} FROM email_marketing_orders WHERE id=?`).bind(id).first<{fileKey:string;fileName:string;fileType:string}>();if(!row?.fileKey)return Response.json({error:"Fichier introuvable."},{status:404});const object=await env.BUCKET.get(row.fileKey);if(!object)return Response.json({error:"Fichier introuvable."},{status:404});const h=new Headers();object.writeHttpMetadata(h);h.set("Content-Type",row.fileType||"application/octet-stream");h.set("Content-Disposition",`inline; filename="${row.fileName.replace(/["\\]/g,"")}"`);h.set("Cache-Control","private, no-store");return new Response(object.body,{headers:h})}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const trackedAd = url.pathname.match(/^\/go\/([a-f0-9]{32})$/);
    if (trackedAd && request.method === "GET")
      return trackAdvertisingClick(request, env, trackedAd[1]);
    if (url.pathname === "/_vinext/image")
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) =>
            env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) =>
            (
              await env.IMAGES.input(body)
                .transform(width > 0 ? { width } : {})
                .output({ format, quality })
            ).response(),
        },
        [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES],
      );
    if(url.pathname==="/api/email-marketing/orders"&&request.method==="POST")return createEmailOrder(request,env);
    if(url.pathname==="/api/email-marketing/account"&&request.method==="GET")return emailPortal(request,env);
    if(url.pathname==="/api/email-marketing/payment-proof"&&request.method==="POST")return emailPayment(request,env);
    if(url.pathname==="/api/admin/email-marketing/orders"&&["GET","PATCH"].includes(request.method))return emailAdmin(request,env);
    const emailAttachment=url.pathname.match(/^\/api\/admin\/email-marketing\/orders\/(\d+)\/attachment$/);if(emailAttachment&&request.method==="GET")return emailFile(request,env,Number(emailAttachment[1]),"attachment");
    const emailProof=url.pathname.match(/^\/api\/admin\/email-marketing\/orders\/(\d+)\/payment-proof$/);if(emailProof&&request.method==="GET")return emailFile(request,env,Number(emailProof[1]),"payment");
    if (url.pathname === "/api/advertising-orders" && request.method === "POST")
      return createAdvertisingOrder(request, env);
    if (
      url.pathname === "/api/advertising-coupons/validate" &&
      request.method === "POST"
    )
      return validateCoupon(request, env);
    if (url.pathname === "/api/ads/account" && request.method === "GET")
      return customerPortal(request, env);
    if (url.pathname === "/api/ads/payment-proof" && request.method === "POST")
      return submitPaymentProof(request, env);
    if (
      url.pathname === "/api/admin/advertising-orders" &&
      request.method === "GET"
    )
      return listOrders(request, env);
    if (
      url.pathname === "/api/admin/advertising-orders" &&
      request.method === "PATCH"
    )
      return updateOrder(request, env);
    if (
      url.pathname === "/api/admin/coupons" &&
      ["GET", "POST", "PATCH"].includes(request.method)
    )
      return couponsAdmin(request, env);
    const match = url.pathname.match(
      /^\/api\/admin\/advertising-orders\/(\d+)\/flyer$/,
    );
    if (match && request.method === "GET")
      return flyer(request, env, Number(match[1]));
    const proofMatch = url.pathname.match(
      /^\/api\/admin\/advertising-orders\/(\d+)\/payment-proof$/,
    );
    if (proofMatch && request.method === "GET")
      return paymentProof(request, env, Number(proofMatch[1]));
    return handler.fetch(request, env, ctx);
  },
};
export default worker;
