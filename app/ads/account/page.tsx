import type { Metadata } from "next";
import CustomerPortal from "./CustomerPortal";
export const metadata:Metadata={title:"Mon espace publicitaire",robots:{index:false,follow:false}};
export default function AccountPage(){return <main className="customer-portal-page"><header className="portal-header"><a className="brand" href="/"><span className="brand-mark"><i/><i/></span><span>HireMe</span></a><a href="/publicite#commande">Nouvelle campagne ↗</a></header><CustomerPortal/></main>}
