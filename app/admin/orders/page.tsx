import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignOutPath } from "../../chatgpt-auth";
import AdminOrders from "./AdminOrders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gestion des commandes publicitaires", robots: { index: false, follow: false } };

const ADMIN_EMAILS = new Set(["ndintekhandson@gmail.com"]);

export default async function OrdersAdminPage() {
  const user = await requireChatGPTUser("/admin/orders");
  const authorized = ADMIN_EMAILS.has(user.email.toLowerCase());

  if (!authorized) {
    return <main className="admin-denied"><div><span>HireMe Admin</span><h1>Accès non autorisé.</h1><p>Ce tableau de bord est réservé aux administrateurs HireMe.</p><a href={chatGPTSignOutPath("/")}>Se déconnecter</a></div></main>;
  }

  return <main className="admin-page">
    <header className="admin-header"><a className="brand" href="/"><span className="brand-mark" aria-hidden="true"><i/><i/></span><span>HireMe</span></a><div><span>Connecté : {user.displayName}</span><a href={chatGPTSignOutPath("/")}>Déconnexion</a></div></header>
    <AdminOrders />
  </main>;
}
