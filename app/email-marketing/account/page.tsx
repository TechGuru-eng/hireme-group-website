import type{Metadata}from"next";import EmailCampaignPortal from"./EmailCampaignPortal";
export const metadata:Metadata={title:"Mon espace Email Marketing",robots:{index:false,follow:false}};
export default function Page(){return <main className="email-account-page"><header className="portal-header"><a className="brand" href="/"><span className="brand-mark"><i/><i/></span><span>HireMe</span></a><a href="/email-marketing">Email Marketing</a></header><EmailCampaignPortal/></main>}
