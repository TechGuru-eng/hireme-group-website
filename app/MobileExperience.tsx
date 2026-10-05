"use client";

import { useEffect, useRef, useState } from "react";

export default function MobileExperience() {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    document.body.classList.toggle("has-brand-signal", Boolean(document.querySelector(".brand-signal")));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("has-brand-signal");
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", onKeyDown);
      window.setTimeout(() => closeButton.current?.focus(), 50);
    }
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function share() {
    const data = { title: "HireMe", text: "Découvrez l’écosystème HireMe : emplois, CV, formations et opportunités.", url: window.location.origin };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.origin);
  }

  return <>
    <button className="mobile-menu-trigger" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" aria-controls="mobile-navigation" aria-expanded={open}><span/><span/></button>
    <div id="mobile-navigation" className={`mobile-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-label="Menu HireMe">
      <div className="drawer-top"><a className="brand" href="/" onClick={() => setOpen(false)}><span className="brand-mark"><i/><i/></span><span>HireMe</span></a><button ref={closeButton} onClick={() => setOpen(false)} aria-label="Fermer le menu">×</button></div>
      <nav aria-label="Navigation mobile">
        <a href="/" onClick={() => setOpen(false)}><small>01</small>Accueil <span>↗</span></a>
        <a href="/#services" onClick={() => setOpen(false)}><small>02</small>Nos services <span>↗</span></a>
        <a href="https://hireme237.com" onClick={() => setOpen(false)}><small>03</small>Offres d’emploi <span>↗</span></a>
        <a href="https://moncvpro.hiremeguide.com" onClick={() => setOpen(false)}><small>04</small>Mon CV Pro <span>↗</span></a>
        <a href="/publicite" onClick={() => setOpen(false)}><small>05</small>Publicité <span>↗</span></a>
        <a href="https://bio.hiremeguide.com/" onClick={() => setOpen(false)}><small>06</small>Communauté <span>↗</span></a>
      </nav>
      <div className="drawer-actions"><button onClick={share}>Partager HireMe <span>↗</span></button><a href="mailto:admin@hiremeguide.com">admin@hiremeguide.com</a></div>
    </div>
    <nav className="mobile-dock" aria-label="Navigation rapide">
      <a href="/"><span>⌂</span><small>Accueil</small></a>
      <a href="https://hireme237.com"><span>↗</span><small>Emplois</small></a>
      <a className="dock-main" href="https://moncvpro.hiremeguide.com"><span>CV</span><small>Mon CV</small></a>
      <a href="/publicite"><span>◎</span><small>Publicité</small></a>
    </nav>
    <button className={`back-to-top ${showTop ? "is-visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Retour en haut">↑</button>
  </>;
}
