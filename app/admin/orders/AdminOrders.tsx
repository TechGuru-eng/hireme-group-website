"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
type Order = {
  id: number;
  reference: string;
  customerName: string;
  businessName: string;
  whatsapp: string;
  email: string;
  category: string;
  durationDays: number;
  posterDesign: number;
  flyerName: string;
  copywriting: number;
  advertisingText: string;
  message: string;
  ctaType: string;
  ctaDestination: string;
  trackingToken: string;
  clickCount: number;
  uniqueClickCount: number;
  lastClickedAt: string;
  subtotalXaf: number;
  couponCode: string;
  couponDiscountXaf: number;
  loyaltyDiscountXaf: number;
  totalXaf: number;
  paymentMethod: string;
  paymentProofName: string;
  paymentSubmittedAt: string;
  status: string;
  adminNotes: string;
  campaignStart: string;
  campaignEnd: string;
  createdAt: string;
  updatedAt: string;
};
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
const labels: Record<string, string> = {
  new: "Nouvelle",
  pending_payment: "Paiement attendu",
  payment_submitted: "Reçu à vérifier",
  paid: "Payée",
  active: "En diffusion",
  completed: "Terminée",
  rejected: "Rejetée",
};
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]),
    [coupons, setCoupons] = useState<Coupon[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [selected, setSelected] = useState<Order | null>(null),
    [saving, setSaving] = useState(false),
    [tab, setTab] = useState<"orders" | "coupons">("orders");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [a, b] = await Promise.all([
      fetch("/api/admin/advertising-orders", { cache: "no-store" }),
      fetch("/api/admin/coupons", { cache: "no-store" }),
    ]);
    const ad = (await a.json()) as { orders?: Order[]; error?: string },
      cd = (await b.json()) as { coupons?: Coupon[]; error?: string };
    if (!a.ok || !b.ok)
      setError(ad.error || cd.error || "Chargement impossible");
    else {
      setOrders(ad.orders ?? []);
      setCoupons(cd.coupons ?? []);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          `${o.reference} ${o.customerName} ${o.businessName} ${o.whatsapp}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [orders, query, status],
  );
  const revenue = orders
    .filter((o) => ["paid", "active", "completed"].includes(o.status))
    .reduce((s, o) => s + o.totalXaf, 0);
  async function save(o: Order) {
    setSaving(true);
    const r = await fetch("/api/admin/advertising-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: o.id,
        status: o.status,
        adminNotes: o.adminNotes,
        campaignStart: o.campaignStart,
        campaignEnd: o.campaignEnd,
        ctaType: o.ctaType,
        ctaDestination: o.ctaDestination,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      setError("Mise à jour impossible");
      return;
    }
    setOrders((x) => x.map((i) => (i.id === o.id ? o : i)));
    setSelected(o);
    void load();
  }
  async function createCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f.entries())),
    });
    const d = (await r.json()) as { error?: string };
    if (!r.ok) {
      setError(d.error ?? "Création impossible");
      return;
    }
    e.currentTarget.reset();
    void load();
  }
  async function toggle(c: Coupon) {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    void load();
  }
  return (
    <>
      <section className="admin-intro">
        <div>
          <p>HireMe Ads Network / Administration</p>
          <h1>Centre de contrôle</h1>
          <span>
            Campagnes, clients, fidélité et coupons depuis un seul espace.
          </span>
        </div>
        <button onClick={() => void load()}>Actualiser ↻</button>
      </section>
      <nav className="admin-tabs">
        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          Campagnes
        </button>
        <button
          className={tab === "coupons" ? "active" : ""}
          onClick={() => setTab("coupons")}
        >
          Coupons & réductions
        </button>
      </nav>
      <section className="admin-stats">
        <article>
          <span>Total commandes</span>
          <strong>{orders.length}</strong>
        </article>
        <article>
          <span>Reçus à vérifier</span>
          <strong>
            {orders.filter((o) => o.status === "payment_submitted").length}
          </strong>
        </article>
        <article>
          <span>Actives</span>
          <strong>{orders.filter((o) => o.status === "active").length}</strong>
        </article>
        <article>
          <span>Revenus confirmés</span>
          <strong>
            {revenue.toLocaleString("fr-FR")} <small>F</small>
          </strong>
        </article>
      </section>
      {error && <p className="admin-error">{error}</p>}
      {tab === "coupons" ? (
        <section className="coupon-admin">
          <form onSubmit={createCoupon}>
            <h2>Créer un coupon</h2>
            <label>
              Code
              <input
                name="code"
                required
                minLength={3}
                placeholder="WELCOME10"
              />
            </label>
            <label>
              Type
              <select name="discountType">
                <option value="percent">Pourcentage</option>
                <option value="fixed">Montant fixe XAF</option>
              </select>
            </label>
            <label>
              Valeur
              <input name="discountValue" type="number" min="1" required />
            </label>
            <label>
              Limite d’utilisations (0 = illimitée)
              <input name="maxUses" type="number" min="0" defaultValue="0" />
            </label>
            <label>
              Date d’expiration
              <input name="expiresAt" type="date" />
            </label>
            <button>Créer le coupon</button>
          </form>
          <div className="coupon-list">
            <h2>Coupons existants</h2>
            {coupons.length === 0 ? (
              <p>Aucun coupon.</p>
            ) : (
              coupons.map((c) => (
                <article key={c.id}>
                  <div>
                    <strong>{c.code}</strong>
                    <span>
                      {c.discountType === "percent"
                        ? `${c.discountValue}%`
                        : `${c.discountValue.toLocaleString("fr-FR")} F`}{" "}
                      · {c.usageCount}/{c.maxUses || "∞"} utilisations
                    </span>
                    {c.expiresAt && <small>Expire le {c.expiresAt}</small>}
                  </div>
                  <button
                    className={c.active ? "on" : ""}
                    onClick={() => void toggle(c)}
                  >
                    {c.active ? "Actif" : "Inactif"}
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="admin-workspace">
          <div className="admin-list-panel">
            <div className="admin-filters">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(labels).map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <p className="admin-empty">Chargement…</p>
            ) : (
              <div className="admin-order-list">
                {filtered.map((o) => (
                  <button
                    key={o.id}
                    className={`${selected?.id === o.id ? "selected " : ""}${o.status === "payment_submitted" ? "has-proof" : ""}`}
                    onClick={() => setSelected(o)}
                  >
                    <div>
                      <span>{o.reference}</span>
                      <strong>{o.businessName}</strong>
                      <small>{o.customerName}</small>
                    </div>
                    <div>
                      <b className={`status-${o.status}`}>{labels[o.status]}</b>
                      <strong>{o.totalXaf.toLocaleString("fr-FR")} F</strong>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <aside className="admin-detail">
            {!selected ? (
              <div className="admin-placeholder">
                <span>↖</span>
                <h2>Sélectionnez une campagne</h2>
              </div>
            ) : (
              <div>
                <div className="admin-detail-head">
                  <div>
                    <span>{selected.reference}</span>
                    <h2>{selected.businessName}</h2>
                    <p>
                      {selected.category} · {selected.durationDays} jours
                    </p>
                  </div>
                  <strong>{selected.totalXaf.toLocaleString("fr-FR")} F</strong>
                </div>
                <div className="admin-contact">
                  <a
                    href={`https://wa.me/${selected.whatsapp.replace(/\D/g, "")}`}
                  >
                    WhatsApp ↗
                  </a>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`}>E-mail ↗</a>
                  )}
                </div>
                <div className="admin-options">
                  <span>
                    <b>Sous-total</b>
                    {(selected.subtotalXaf || selected.totalXaf).toLocaleString(
                      "fr-FR",
                    )}{" "}
                    F
                  </span>
                  <span>
                    <b>Réductions</b>
                    {(
                      selected.couponDiscountXaf + selected.loyaltyDiscountXaf
                    ).toLocaleString("fr-FR")}{" "}
                    F
                  </span>
                </div>
                {selected.couponCode && (
                  <p className="admin-copy">
                    Coupon : <strong>{selected.couponCode}</strong>
                  </p>
                )}
                {!selected.posterDesign && (
                  <a
                    className="admin-flyer"
                    href={`/api/admin/advertising-orders/${selected.id}/flyer`}
                    target="_blank"
                  >
                    Voir l’affiche ↗
                  </a>
                )}
                {selected.paymentProofName && (
                  <div className="admin-payment-proof">
                    <div>
                      <span>
                        Paiement {selected.paymentMethod?.toUpperCase()}
                      </span>
                      <strong>
                        Reçu envoyé{" "}
                        {selected.paymentSubmittedAt
                          ? new Date(
                              selected.paymentSubmittedAt,
                            ).toLocaleString("fr-FR")
                          : ""}
                      </strong>
                    </div>
                    <a
                      href={`/api/admin/advertising-orders/${selected.id}/payment-proof`}
                      target="_blank"
                    >
                      Ouvrir le reçu ↗
                    </a>
                    <button
                      disabled={saving}
                      onClick={() =>
                        void save({ ...selected, status: "paid" })
                      }
                    >
                      {saving ? "Approbation…" : "Approuver le paiement"}
                    </button>
                  </div>
                )}
                {selected.advertisingText && (
                  <div className="admin-copy">
                    <span>Texte</span>
                    <p>{selected.advertisingText}</p>
                  </div>
                )}
                <div className="admin-tracking">
                  <div className="admin-options">
                    <span><b>Clics totaux</b>{selected.clickCount ?? 0}</span>
                    <span><b>Visiteurs distincts</b>{selected.uniqueClickCount ?? 0}</span>
                  </div>
                  {selected.lastClickedAt&&<small>Dernier clic : {new Date(selected.lastClickedAt).toLocaleString("fr-FR")}</small>}
                  <label>Destination du CTA
                    <select value={selected.ctaType||"whatsapp"} onChange={e=>setSelected({...selected,ctaType:e.target.value})}>
                      <option value="whatsapp">WhatsApp</option><option value="website">Site web</option>
                    </select>
                    <input value={selected.ctaDestination||""} onChange={e=>setSelected({...selected,ctaDestination:e.target.value})} placeholder={selected.ctaType==="website"?"https://site.com/offre":"+237 6XX XXX XXX"}/>
                  </label>
                  {selected.trackingToken&&<><code className="tracking-url">https://hiremegroup.com/go/{selected.trackingToken}</code><div className="tracking-actions"><button type="button" onClick={async()=>{const link=`https://hiremegroup.com/go/${selected.trackingToken}`;try{await navigator.clipboard.writeText(link)}catch{const area=document.createElement("textarea");area.value=link;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}window.alert("Lien CTA copié.")}}>Copier le lien CTA traçable</button><a href={`/go/${selected.trackingToken}`} target="_blank" rel="noreferrer">Tester le lien ↗</a></div></>}
                </div>
                <label className="admin-status">
                  Statut
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      setSelected({ ...selected, status: e.target.value })
                    }
                  >
                    {Object.entries(labels).map(([v, l]) => (
                      <option value={v} key={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-date-row">
                  <label>
                    Début
                    <input
                      type="date"
                      value={selected.campaignStart || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          campaignStart: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Fin
                    <input
                      type="date"
                      value={selected.campaignEnd || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          campaignEnd: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label className="admin-notes">
                  Mise à jour / notes
                  <textarea
                    rows={4}
                    value={selected.adminNotes}
                    onChange={(e) =>
                      setSelected({ ...selected, adminNotes: e.target.value })
                    }
                  />
                </label>
                <button
                  className="admin-save"
                  disabled={saving}
                  onClick={() => void save(selected)}
                >
                  {saving ? "Enregistrement…" : "Publier la mise à jour"}
                </button>
              </div>
            )}
          </aside>
        </section>
      )}
    </>
  );
}
