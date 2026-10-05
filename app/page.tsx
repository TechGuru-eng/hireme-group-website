const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main>
      <div className="brand-signal" role="note">
        <span>Depuis 2022</span><i />
        <span>Créé au Cameroun</span><i />
        <span>37 000+ personnes connectées</span>
        <a href="https://www.whatsapp.com/channel/0029Vb6XRzI1t90bk6USq33g">Rejoindre le mouvement <Arrow /></a>
      </div>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="HireMe, accueil">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span>HireMe</span>
        </a>
        <nav aria-label="Navigation principale">
          <a className="active" href="#accueil">Accueil</a>
          <a href="#services">Services</a>
          <a href="#ecosysteme">Écosystème</a>
          <a href="/publicite">Publicité</a>
          <a href="/email-marketing">Email Marketing</a>
          <a href="#apropos">À propos</a>
        </nav>
        <a className="nav-cta" href="#contact">Nous contacter <Arrow /></a>
      </header>

      <section className="hero" id="accueil">
        <div className="hero-copy">
          <div className="hero-status"><i /> Écosystème carrière nouvelle génération</div>
          <p className="eyebrow"><span /> La carrière que vous méritez</p>
          <h1>Le potentiel existe.<br />Nous créons<br />le passage<span>.</span></h1>
          <p className="hero-text">HireMe transforme l’information en opportunités concrètes : emplois, candidatures plus fortes, compétences utiles et connexions qui font avancer.</p>
          <div className="hero-actions">
            <a className="button primary" href="https://hireme237.com">Voir les opportunités <Arrow /></a>
            <a className="button secondary" href="https://moncvpro.hiremeguide.com">Renforcer mon CV <Arrow /></a>
          </div>
          <div className="hero-assurances" aria-label="Engagements HireMe"><span>✓ Offres accessibles</span><span>✓ Ancré au Cameroun</span><span>✓ Accompagnement humain</span></div>
        </div>
        <div className="hero-visual" aria-label="Jeune professionnel accompagné par HireMe">
          <div className="yellow-panel" />
          <div className="yellow-disc" />
          <div className="city-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <img src="/hero-professional.png" alt="Jeune professionnel africain souriant, en tenue professionnelle" />
          <div className="floating-card floating-card-one"><small>COMMUNAUTÉ</small><strong>37K+</strong><span>personnes connectées</span></div>
          <div className="floating-card floating-card-two"><small>IMPACT</small><strong>1 000+</strong><span>réussites accompagnées</span></div>
          <div className="opportunity-tag"><strong>+100</strong><span>opportunités<br />chaque semaine</span></div>
        </div>
      </section>

      <div className="trust-marquee" aria-label="Services HireMe"><div><span>OFFRES D’EMPLOI</span><i>✦</i><span>CV ATS</span><i>✦</i><span>FORMATIONS</span><i>✦</i><span>COMMUNAUTÉ</span><i>✦</i><span>PUBLICITÉ</span><i>✦</i><span>OUTILS IA</span><i>✦</i><span>OFFRES D’EMPLOI</span><i>✦</i><span>CV ATS</span></div></div>

      <section className="mobile-shortcuts" aria-label="Accès rapides">
        <a href="https://hireme237.com"><span>01</span><strong>Trouver un emploi</strong><small>Voir les dernières offres</small><i>↗</i></a>
        <a href="https://moncvpro.hiremeguide.com"><span>02</span><strong>Créer mon CV</strong><small>Un CV professionnel et ATS</small><i>↗</i></a>
        <a href="https://cvcheck.hiremeguide.com"><span>03</span><strong>Analyser mon CV</strong><small>Recevoir un diagnostic</small><i>↗</i></a>
        <a href="/publicite"><span>04</span><strong>Faire ma publicité</strong><small>Toucher notre communauté</small><i>↗</i></a>
      </section>

      <section className="proof" aria-label="Impact de HireMe">
        <article><span className="proof-icon">●●●</span><div><strong>15 000+</strong><p>membres dans la communauté</p></div></article>
        <article><span className="proof-icon">★</span><div><strong>1 000+</strong><p>personnes accompagnées vers l’emploi</p></div></article>
        <article><span className="proof-icon">▣</span><div><strong>100+</strong><p>opportunités partagées par semaine</p></div></article>
      </section>

      <section className="audience-paths section" id="pour-qui">
        <div className="audience-heading">
          <p className="section-kicker">Choisissez votre objectif</p>
          <h2>Une marque.<br />Trois chemins.</h2>
          <p>HireMe relie ceux qui cherchent une opportunité, ceux qui recrutent et ceux qui veulent faire connaître leur activité.</p>
        </div>
        <div className="audience-grid">
          <a href="https://hireme237.com"><span>01 / TALENTS</span><strong>Je cherche un emploi</strong><p>Accédez aux offres, conseils, outils CV et ressources pour candidater avec méthode.</p><b>Explorer les opportunités <Arrow /></b></a>
          <a href="mailto:admin@hiremeguide.com?subject=Recrutement%20via%20HireMe"><span>02 / RECRUTEURS</span><strong>Je cherche des talents</strong><p>Présentez vos besoins à une communauté active de candidats et de professionnels.</p><b>Parler à notre équipe <Arrow /></b></a>
          <a className="audience-highlight" href="/publicite"><span>03 / ENTREPRENEURS</span><strong>Je veux être visible</strong><p>Diffusez vos produits, services et événements dans notre écosystème communautaire.</p><b>Découvrir la publicité <Arrow /></b></a>
        </div>
      </section>

      <section className="intro section" id="apropos">
        <div className="section-kicker">01 — Notre mission</div>
        <div className="intro-grid">
          <h2>Bien plus qu’une page d’offres d’emploi.</h2>
          <div>
            <p className="lead">HireMe est un écosystème camerounais qui rapproche les talents, les opportunités et les outils nécessaires pour bâtir une carrière.</p>
            <p>Depuis 2022, nous rendons la recherche d’emploi plus simple, plus sûre et plus efficace : information vérifiée, accompagnement professionnel, outils numériques et entraide communautaire.</p>
            <a className="text-link" href="#ecosysteme">Explorer notre écosystème <Arrow /></a>
          </div>
        </div>
      </section>

      <section className="services section" id="services">
        <div className="section-heading">
          <div><p className="section-kicker light">02 — Nos services</p><h2>Tout ce qu’il vous faut pour avancer.</h2></div>
          <p>Des solutions pratiques pour chaque étape : trouver, postuler, se démarquer, apprendre et développer son réseau.</p>
        </div>
        <div className="service-grid">
          <article className="service-card featured"><span className="card-number">01</span><div className="card-icon">CV</div><h3>Mon CV Pro</h3><p>CV professionnel optimisé ATS, lettre de motivation et accompagnement CV Care pour multiplier vos chances d’entretien.</p><a href="https://moncvpro.hiremeguide.com">Créer un CV performant <Arrow /></a></article>
          <article className="service-card"><span className="card-number">02</span><div className="card-icon">↗</div><h3>HireMe Jobs</h3><p>Consultez nos offres d’emploi sélectionnées dans plusieurs villes et secteurs au Cameroun.</p><a href="https://hireme237.com">Voir les offres <Arrow /></a></article>
          <article className="service-card"><span className="card-number">03</span><div className="card-icon">AI</div><h3>CVCheck</h3><p>Analysez votre CV et obtenez des recommandations pour améliorer votre candidature.</p><a href="https://cvcheck.hiremeguide.com">Analyser mon CV <Arrow /></a></article>
          <article className="service-card"><span className="card-number">04</span><div className="card-icon">▶</div><h3>Formations</h3><p>Des ressources et formations accessibles pour développer les compétences demandées sur le marché.</p><a href="https://boutique.hiremeguide.com">Voir les ressources <Arrow /></a></article>
          <article className="service-card"><span className="card-number">05</span><div className="card-icon">◎</div><h3>Communauté & réseau</h3><p>Retrouvez tous nos groupes, canaux et espaces dédiés aux candidats, professionnels et entrepreneurs.</p><a href="https://bio.hiremeguide.com/">Explorer l’écosystème <Arrow /></a></article>
          <article className="service-card"><span className="card-number">06</span><div className="card-icon">!</div><h3>Scams Alert</h3><p>Un espace de sensibilisation pour reconnaître les fausses offres et rechercher un emploi en toute sécurité.</p><a href="https://scamsalert.hiremeguide.com">Vérifier une offre <Arrow /></a></article>
          <article className="service-card featured"><span className="card-number">07</span><div className="card-icon">@</div><h3>Email Marketing</h3><p>Présentez vos formations, coachings, ateliers, produits et services à plus de 2 000 contacts e-mail.</p><a href="/email-marketing">Lancer une campagne <Arrow /></a></article>
        </div>
      </section>

      <section className="platforms section" aria-labelledby="platforms-title">
        <p className="section-kicker">L’écosystème HireMe</p>
        <div className="platforms-heading"><h2 id="platforms-title">Restez connecté.<br />Ne manquez rien.</h2><p>Offres, conseils, ressources et opportunités commerciales : choisissez les espaces qui correspondent à vos objectifs.</p></div>
        <div className="platform-links">
          <a href="https://www.whatsapp.com/channel/0029Vb6XRzI1t90bk6USq33g"><span>01</span><div><strong>Canal WhatsApp principal</strong><small>Recevez les nouvelles opportunités</small></div><Arrow /></a>
          <a href="https://hiremeguide.com"><span>02</span><div><strong>Newsletter HireMe</strong><small>Conseils et ressources directement par e-mail</small></div><Arrow /></a>
          <a href="https://www.linkedin.com/company/hireme-cm"><span>03</span><div><strong>Page LinkedIn</strong><small>Suivez l’actualité professionnelle de HireMe</small></div><Arrow /></a>
          <a href="https://bio.hiremeguide.com/"><span>04</span><div><strong>Tous nos groupes</strong><small>Accédez à l’ensemble de l’écosystème</small></div><Arrow /></a>
          <a className="platform-ad" href="/publicite"><span>05</span><div><strong>Faites votre publicité</strong><small>Présentez votre activité à notre communauté</small></div><Arrow /></a>
          <a href="/email-marketing"><span>06</span><div><strong>Email Marketing</strong><small>Votre offre dans plus de 2 000 boîtes mail</small></div><Arrow /></a>
        </div>
      </section>

      <section className="journey section" id="ecosysteme">
        <p className="section-kicker">03 — Votre parcours</p>
        <div className="journey-top"><h2>Une plateforme.<br />Toutes les étapes.</h2><p>HireMe ne se contente pas de partager une offre. Nous vous aidons à devenir le candidat capable de la décrocher.</p></div>
        <div className="steps">
          <article><span>01</span><div className="step-line" /><h3>Découvrez</h3><p>Accédez aux opportunités adaptées à votre profil et à votre région.</p></article>
          <article><span>02</span><div className="step-line" /><h3>Préparez</h3><p>Renforcez votre CV, votre lettre et votre stratégie de candidature.</p></article>
          <article><span>03</span><div className="step-line" /><h3>Progressez</h3><p>Développez vos compétences grâce à nos contenus et formations.</p></article>
          <article><span>04</span><div className="step-line" /><h3>Connectez</h3><p>Rejoignez une communauté qui partage conseils, expériences et contacts.</p></article>
        </div>
      </section>

      <section className="impact section">
        <div className="impact-panel">
          <div><p className="section-kicker light">04 — Notre impact</p><h2>Nous mesurons notre réussite par la vôtre.</h2><p>Chaque CV amélioré, chaque entretien obtenu et chaque emploi décroché donne du sens à notre mission.</p></div>
          <div className="impact-numbers"><article><strong>15K+</strong><span>membres</span></article><article><strong>1K+</strong><span>réussites accompagnées</span></article><article><strong>10+</strong><span>groupes actifs</span></article><article><strong>2022</strong><span>année de création</span></article></div>
        </div>
      </section>

      <section className="promise section">
        <p className="section-kicker">05 — Pourquoi HireMe</p>
        <h2>Proche du terrain.<br />Pensé pour l’Afrique.</h2>
        <div className="promise-grid">
          <article><span>✓</span><h3>Accessible</h3><p>Des services conçus pour les réalités et les budgets des chercheurs d’emploi.</p></article>
          <article><span>✓</span><h3>Pratique</h3><p>Des actions concrètes, des outils simples et des résultats mesurables.</p></article>
          <article><span>✓</span><h3>Communautaire</h3><p>Une force collective qui met l’information et les opportunités en circulation.</p></article>
          <article><span>✓</span><h3>Responsable</h3><p>Nous défendons une recherche d’emploi sans paiement pour obtenir un poste.</p></article>
        </div>
      </section>

      <section className="brand-standard section">
        <div className="standard-statement">
          <p className="section-kicker light">Le standard HireMe</p>
          <h2>La confiance n’est pas un slogan. C’est notre méthode.</h2>
          <p>Dans un marché où l’information est abondante mais la confiance rare, HireMe construit un environnement plus clair, plus utile et plus responsable.</p>
        </div>
        <div className="standard-list">
          <article><span>01</span><div><h3>Utilité avant le bruit</h3><p>Nous privilégions les ressources qui aident réellement notre communauté à agir.</p></div></article>
          <article><span>02</span><div><h3>Protection des candidats</h3><p>Nous rappelons une règle non négociable : personne ne doit payer pour obtenir un emploi.</p></div></article>
          <article><span>03</span><div><h3>Solutions adaptées au terrain</h3><p>Nos services répondent aux réalités, aux usages mobiles et aux budgets du marché africain.</p></div></article>
        </div>
      </section>

      <section className="faq section" aria-labelledby="faq-title">
        <div className="faq-intro"><p className="section-kicker">Questions fréquentes</p><h2 id="faq-title">Avant de commencer.</h2><p>Des réponses directes pour choisir le bon service et avancer sans perdre de temps.</p><a href="mailto:admin@hiremeguide.com">Poser une autre question <Arrow /></a></div>
        <div className="faq-list">
          <details><summary>Les offres d’emploi sont-elles payantes ? <span>+</span></summary><p>Non. HireMe ne demande jamais de payer pour accéder à un poste. Méfiez-vous de toute personne qui exige de l’argent en échange d’un recrutement.</p></details>
          <details><summary>Comment recevoir les nouvelles opportunités ? <span>+</span></summary><p>Rejoignez notre canal WhatsApp principal ou consultez HireMe Jobs pour accéder aux offres publiées.</p></details>
          <details><summary>HireMe peut-il améliorer ma candidature ? <span>+</span></summary><p>Oui. Mon CV Pro propose des CV professionnels optimisés ATS, des lettres de motivation et un accompagnement adapté à votre objectif.</p></details>
          <details><summary>Comment faire connaître mon activité ? <span>+</span></summary><p>Notre service publicitaire diffuse votre annonce matin et soir dans nos chaînes et groupes WhatsApp, selon la formule choisie.</p></details>
        </div>
      </section>

      <section className="final-cta" id="contact">
        <div><p className="section-kicker light">Votre prochaine étape</p><h2>Votre ambition mérite un écosystème.</h2><p>Choisissez votre prochain mouvement : trouver une opportunité, renforcer votre candidature ou développer votre visibilité.</p></div>
        <div className="cta-buttons"><a className="button primary" href="https://www.whatsapp.com/channel/0029Vb6XRzI1t90bk6USq33g">Rejoindre le canal WhatsApp <Arrow /></a><a className="button dark-outline" href="https://moncvpro.hiremeguide.com">Optimiser mon CV <Arrow /></a></div>
      </section>

      <footer>
        <div className="footer-brand"><a className="brand" href="#accueil"><span className="brand-mark" aria-hidden="true"><i /><i /></span><span>HireMe</span></a><p>Des opportunités. Des outils.<br />Un avenir professionnel.</p></div>
        <div><h3>Explorer</h3><a href="#services">Services</a><a href="#ecosysteme">Écosystème</a><a href="/publicite">Publicité</a><a href="/email-marketing">Email Marketing</a><a href="#apropos">À propos</a></div>
        <div><h3>Plateformes</h3><a href="https://hireme237.com">Offres d’emploi</a><a href="https://moncvpro.hiremeguide.com">Mon CV Pro</a><a href="https://cvcheck.hiremeguide.com">CVCheck</a><a href="https://boutique.hiremeguide.com">Boutique</a><a href="https://scamsalert.hiremeguide.com">Scams Alert</a></div>
        <div><h3>Contact</h3><a href="mailto:admin@hiremeguide.com">admin@hiremeguide.com</a><a href="https://www.linkedin.com/company/hireme-cm">LinkedIn</a><a href="https://bio.hiremeguide.com/">Groupes & canaux</a><span>Cameroun</span></div>
        <p className="copyright">© 2026 HireMe Group. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
