"use client";
import { FormEvent, useEffect, useState } from "react";
type Order = {
  reference: string;
  businessName: string;
  category: string;
  durationDays: number;
  subtotalXaf: number;
  couponCode: string;
  couponDiscountXaf: number;
  loyaltyDiscountXaf: number;
  totalXaf: number;
  status: string;
  paymentMethod: string;
  paymentSubmittedAt: string;
  campaignStart: string;
  campaignEnd: string;
  ctaType: string;
  trackingToken: string;
  clickCount: number;
  uniqueClickCount: number;
  lastClickedAt: string;
  createdAt: string;
  updatedAt: string;
};
type Data = {
  account: { customerName: string; completedOrders: number };
  loyalty: {
    completed: number;
    target: number;
    eligible: boolean;
    discountPercent: number;
  };
  orders: Order[];
};
const labels: Record<string, string> = {
  new: "Nouvelle",
  pending_payment: "Paiement attendu",
  payment_submitted: "Reçu en vérification",
  paid: "Payée",
  active: "En diffusion",
  completed: "Terminée",
  rejected: "Rejetée",
};
const ussd = (method: "mtn" | "orange", amount: number) =>
  method === "mtn"
    ? `*126*14*654250688*${amount}#`
    : `#150*1*1*659197506*${amount}#`;
const dial = (code: string) => `tel:${code.replace(/#/g, "%23")}`;

function Payment({
  order,
  accessKey,
  onSent,
}: {
  order: Order;
  accessKey: string;
  onSent: () => void;
}) {
  const [method, setMethod] = useState<"mtn" | "orange">("mtn"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    code = ussd(method, order.totalXaf);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("key", accessKey);
    form.set("reference", order.reference);
    form.set("paymentMethod", method);
    try {
      const r = await fetch("/api/ads/payment-proof", {
          method: "POST",
          body: form,
        }),
        d = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(d.error ?? "Envoi impossible.");
        return;
      }
      onSent();
    } catch {
      setError("Connexion interrompue. Réessayez sans fermer cette page.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="payment-gateway">
      <div className="payment-title">
        <span>Paiement Mobile Money</span>
        <strong>{order.totalXaf.toLocaleString("fr-FR")} FCFA</strong>
      </div>
      <div className="payment-methods">
        <button
          className={method === "mtn" ? "active mtn" : "mtn"}
          onClick={() => setMethod("mtn")}
          type="button"
        >
          <i>MTN</i>
          <span>MTN MoMo</span>
        </button>
        <button
          className={method === "orange" ? "active orange" : "orange"}
          onClick={() => setMethod("orange")}
          type="button"
        >
          <i>OM</i>
          <span>Orange Money</span>
        </button>
      </div>
      <div className="ussd-card">
        <small>Code préparé avec le montant exact</small>
        <code>{code}</code>
        <a href={dial(code)}>Composer et payer maintenant ↗</a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(code)}
        >
          Copier le code
        </button>
      </div>
      <p className="phone-note">
        Le bouton de paiement fonctionne sur un téléphone équipé de la carte SIM
        correspondante. Vérifiez le bénéficiaire <b>NJAI NDINTEK HANDSON</b>{" "}
        avant de confirmer.
      </p>
      <form className="proof-form" onSubmit={submit}>
        <label>
          <strong>Après le paiement, envoyez votre reçu*</strong>
          <span>Capture d’écran ou reçu JPG, PNG, WEBP ou PDF · 8 Mo max.</span>
          <input
            name="proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button disabled={busy}>
          {busy ? "Envoi du reçu…" : "Envoyer le reçu pour vérification"}
        </button>
      </form>
      <small className="payment-security">
        Votre campagne ne sera marquée « Payée » qu’après vérification manuelle
        par HireMe.
      </small>
    </div>
  );
}

export default function CustomerPortal() {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [key, setKey] = useState("");
  const load = (accessKey: string) =>
    fetch(`/api/ads/account?key=${encodeURIComponent(accessKey)}`, {
      cache: "no-store",
    }).then(async (r) => {
      const d = (await r.json()) as Data & { error?: string };
      if (!r.ok) throw new Error(d.error);
      setData(d);
    });
  useEffect(() => {
    const accessKey =
      new URLSearchParams(window.location.search).get("key") ?? "";
    setKey(accessKey);
    if (!accessKey) {
      setError("Ce lien d’accès est incomplet.");
      setLoading(false);
      return;
    }
    load(accessKey)
      .catch((e) => setError(e.message || "Accès impossible"))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <section className="portal-state">Ouverture de votre espace…</section>
    );
  if (error || !data)
    return (
      <section className="portal-state">
        <span>Lien privé</span>
        <h1>Accès impossible</h1>
        <p>{error}</p>
        <a href="/publicite#commande">Créer une nouvelle commande</a>
      </section>
    );
  return (
    <>
      <section className="portal-hero">
        <div>
          <p>Votre espace publicitaire</p>
          <h1>Bonjour, {data.account.customerName}.</h1>
          <span>
            Payez, envoyez votre reçu et suivez vos campagnes depuis un seul
            espace.
          </span>
        </div>
        <aside className={data.loyalty.eligible ? "eligible" : ""}>
          <small>Programme fidélité</small>
          <strong>{Math.min(data.loyalty.completed, 3)}/3</strong>
          <p>
            {data.loyalty.eligible
              ? "10 % de réduction activée sur vos nouvelles campagnes."
              : `${3 - data.loyalty.completed} campagne(s) terminée(s) avant votre remise automatique.`}
          </p>
          <div>
            <i
              style={{
                width: `${Math.min(100, (data.loyalty.completed / 3) * 100)}%`,
              }}
            />
          </div>
        </aside>
      </section>
      <section className="portal-orders">
        <div className="portal-section-head">
          <div>
            <p>Historique</p>
            <h2>Vos campagnes</h2>
          </div>
          <a href="/publicite#commande">+ Commander une campagne</a>
        </div>
        {data.orders.length === 0 ? (
          <p>Aucune campagne.</p>
        ) : (
          <div className="campaign-grid">
            {data.orders.map((o) => (
              <article
                key={o.reference}
                className={
                  o.status === "new" || o.status === "pending_payment"
                    ? "awaiting-payment"
                    : ""
                }
              >
                <div className="campaign-top">
                  <span>{o.reference}</span>
                  <b className={`portal-status status-${o.status}`}>
                    {labels[o.status] ?? o.status}
                  </b>
                </div>
                <h3>{o.businessName}</h3>
                <p>
                  {o.category} · {o.durationDays} jour(s)
                </p>
                <div className="campaign-money">
                  <span>Total</span>
                  <strong>{o.totalXaf.toLocaleString("fr-FR")} F</strong>
                </div>
                {o.trackingToken && (
                  <div className="click-report">
                    <div><span>Clics sur votre annonce</span><strong>{o.clickCount ?? 0}</strong></div>
                    <div><span>Visiteurs distincts</span><strong>{o.uniqueClickCount ?? 0}</strong></div>
                    <small>{o.lastClickedAt ? `Dernier clic : ${new Date(o.lastClickedAt).toLocaleString("fr-FR")}` : "Aucun clic enregistré pour le moment."}</small>
                    <code className="tracking-url">https://hiremegroup.com/go/{o.trackingToken}</code>
                    <div className="tracking-actions"><button type="button" onClick={async()=>{const link=`https://hiremegroup.com/go/${o.trackingToken}`;try{await navigator.clipboard.writeText(link)}catch{const area=document.createElement("textarea");area.value=link;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}window.alert("Lien CTA copié.")}}>Copier le lien CTA traçable</button><a href={`/go/${o.trackingToken}`} target="_blank" rel="noreferrer">Tester le lien ↗</a></div>
                  </div>
                )}
                {(o.couponDiscountXaf > 0 || o.loyaltyDiscountXaf > 0) && (
                  <div className="discount-tags">
                    {o.couponDiscountXaf > 0 && (
                      <span>
                        Coupon {o.couponCode}: −
                        {o.couponDiscountXaf.toLocaleString("fr-FR")} F
                      </span>
                    )}
                    {o.loyaltyDiscountXaf > 0 && (
                      <span>
                        Fidélité: −
                        {o.loyaltyDiscountXaf.toLocaleString("fr-FR")} F
                      </span>
                    )}
                  </div>
                )}
                {(o.status === "new" || o.status === "pending_payment") && (
                  <Payment
                    order={o}
                    accessKey={key}
                    onSent={() => void load(key)}
                  />
                )}{" "}
                {o.status === "payment_submitted" && (
                  <div className="proof-pending">
                    <b>Reçu envoyé ✓</b>
                    <span>
                      HireMe vérifie maintenant votre paiement
                      {o.paymentSubmittedAt
                        ? ` envoyé le ${new Date(o.paymentSubmittedAt).toLocaleDateString("fr-FR")}`
                        : ""}
                      .
                    </span>
                  </div>
                )}
                <div className="campaign-dates">
                  <span>
                    Commandée le{" "}
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  {o.campaignStart && (
                    <span>
                      Diffusion : {o.campaignStart}
                      {o.campaignEnd ? ` → ${o.campaignEnd}` : ""}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="private-note">
          🔒 Gardez ce lien privé : il permet de payer et de suivre vos
          campagnes.
        </p>
      </section>
    </>
  );
}
