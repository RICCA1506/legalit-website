import civilLawImg from "@assets/optimized/stock_images/corporate_law_busine_57c34f12.webp";
import civilLawImgAvif from "@assets/optimized/stock_images/corporate_law_busine_57c34f12.avif";
import criminalLawImg from "@assets/87-1260x758_1770824384776.jpg";
const criminalLawImgAvif = criminalLawImg;
import laborLawImg from "@assets/optimized/stock_images/employment_labor_law_2799a570.webp";
import laborLawImgAvif from "@assets/optimized/stock_images/employment_labor_law_2799a570.avif";
import administrativeLawImg from "@assets/optimized/stock_images/administrative_law_g_8387b6bd.webp";
import administrativeLawImgAvif from "@assets/optimized/stock_images/administrative_law_g_8387b6bd.avif";

import contractSigningImg from "@assets/optimized/generated_images/contract_signing_legal_document.webp";
import contractSigningImgAvif from "@assets/optimized/generated_images/contract_signing_legal_document.avif";
import familyInheritanceImg from "@assets/optimized/generated_images/family_inheritance_succession_law.webp";
import familyInheritanceImgAvif from "@assets/optimized/generated_images/family_inheritance_succession_law.avif";
import consumerProtectionImg from "@assets/optimized/generated_images/consumer_protection_rights_law.webp";
import consumerProtectionImgAvif from "@assets/optimized/generated_images/consumer_protection_rights_law.avif";
import insuranceClaimsImg from "@assets/optimized/generated_images/insurance_claims_damages_law.webp";
import insuranceClaimsImgAvif from "@assets/optimized/generated_images/insurance_claims_damages_law.avif";
import insuranceProfessionalsImg from "@assets/optimized/insurance-professionals.webp";
import insuranceProfessionalsImgAvif from "@assets/optimized/insurance-professionals.avif";
import healthcareDoctorsImg from "@assets/optimized/Camice-medico_1769425867517.webp";
import healthcareDoctorsImgAvif from "@assets/optimized/Camice-medico_1769425867517.avif";
import solidarityNonprofitImg from "@assets/optimized/solidarieta-1_1769426085688.webp";
import solidarityNonprofitImgAvif from "@assets/optimized/solidarieta-1_1769426085688.avif";
import parliamentBuildingImg from "@assets/optimized/parlamento_1769425734883.webp";
import parliamentBuildingImgAvif from "@assets/optimized/parlamento_1769425734883.avif";
import corporateMeetingImg from "@assets/optimized/generated_images/corporate_commercial_law_meeting.webp";
import corporateMeetingImgAvif from "@assets/optimized/generated_images/corporate_commercial_law_meeting.avif";
import bankruptcyImg from "@assets/optimized/generated_images/bankruptcy_insolvency_proceedings.webp";
import bankruptcyImgAvif from "@assets/optimized/generated_images/bankruptcy_insolvency_proceedings.avif";
import criminalCourtImg from "@assets/optimized/generated_images/criminal_court_justice_scene.webp";
import criminalCourtImgAvif from "@assets/optimized/generated_images/criminal_court_justice_scene.avif";
import medicalMalpracticeImg from "@assets/optimized/generated_images/medical_malpractice_legal_documents.webp";
import medicalMalpracticeImgAvif from "@assets/optimized/generated_images/medical_malpractice_legal_documents.avif";
import taxCrimesImg from "@assets/optimized/generated_images/tax_crimes_fraud_investigation.webp";
import taxCrimesImgAvif from "@assets/optimized/generated_images/tax_crimes_fraud_investigation.avif";
import environmentalImg from "@assets/optimized/generated_images/environmental_crimes_law_concept.webp";
import environmentalImgAvif from "@assets/optimized/generated_images/environmental_crimes_law_concept.avif";
import cyberCrimesImg from "@assets/optimized/generated_images/cyber_crimes_digital_security.webp";
import cyberCrimesImgAvif from "@assets/optimized/generated_images/cyber_crimes_digital_security.avif";
import dismissalImg from "@assets/optimized/generated_images/employment_dismissal_termination.webp";
import dismissalImgAvif from "@assets/optimized/generated_images/employment_dismissal_termination.avif";
import unionLaborImg from "@assets/optimized/generated_images/union_labor_collective_bargaining.webp";
import unionLaborImgAvif from "@assets/optimized/generated_images/union_labor_collective_bargaining.avif";
import publicProcurementImg from "@assets/optimized/generated_images/public_procurement_tender_bids.webp";
import publicProcurementImgAvif from "@assets/optimized/generated_images/public_procurement_tender_bids.avif";
import urbanPlanningImg from "@assets/optimized/generated_images/urban_planning_building_permits.webp";
import urbanPlanningImgAvif from "@assets/optimized/generated_images/urban_planning_building_permits.avif";
import sportsLawImg from "@assets/optimized/generated_images/sports_law_athlete_contracts.webp";
import sportsLawImgAvif from "@assets/optimized/generated_images/sports_law_athlete_contracts.avif";
import laborLawNewImg from "@assets/salute-sicurezza-lavoro_1770824647657.jpg";
import adminLawNewImg from "@assets/admin-law-new.png";
import corporateLawNewImg from "@assets/corporate-law-new.jpg";
import bankingFinanceNewImg from "@assets/banking-finance-new.jpg";

export interface PracticeArea {
  id: string;
  titleIT: string;
  titleEN: string;
  shortDescriptionIT: string;
  shortDescriptionEN: string;
  fullDescriptionIT: string;
  fullDescriptionEN: string;
  image: string;
  imageAvif: string;
  icon: string;
  isPrimary?: boolean;
}

export const practiceAreasEnhanced: PracticeArea[] = [
  {
    id: "diritto-lavoro",
    titleIT: "Diritto del Lavoro, Previdenza e Relazioni Industriali",
    titleEN: "Labor Law, Social Security and Industrial Relations",
    shortDescriptionIT: "Consulenza e contenzioso in materia giuslavoristica per imprese e lavoratori.",
    shortDescriptionEN: "Advice and litigation in employment law for businesses and workers.",
    fullDescriptionIT: `Legalit, attraverso il proprio dipartimento specializzato, presta **assistenza giudiziale e consulenza stragiudiziale** a imprese, gruppi societari, società partecipate, enti pubblici e pubbliche amministrazioni in materia di **diritto del lavoro, sindacale e previdenziale**.

Lo Studio garantisce una **consulenza continuativa** tesa alla corretta gestione del rapporto di lavoro, dal **drafting contrattuale** agli inquadramenti, dalla definizione delle **politiche retributive e dei sistemi incentivanti** all'esercizio del **potere disciplinare**, in osservanza delle relative garanzie procedurali, assicurando altresì la necessaria assistenza tecnica nei procedimenti ispettivi previdenziali.

Lo Studio supporta le imprese nelle operazioni di **riorganizzazione e ristrutturazione aziendale**, curando l'attivazione degli **ammortizzatori sociali** e lo svolgimento delle procedure di gestione degli esuberi, i processi di outsourcing, appalti e distacchi, al fine di prevenire l'insorgenza del contenzioso. L'affiancamento al management si declina tanto nella negoziazione di contratti, **patti di non concorrenza** e accordi di retention, quanto nella gestione stragiudiziale e contenziosa delle risoluzioni del rapporto.

Particolare attenzione è dedicata alle **relazioni industriali**, con un'assistenza mirata nella negoziazione di **accordi collettivi di secondo livello**.

I professionisti dello Studio affiancano inoltre le imprese nelle **operazioni straordinarie e di M&A**: l'intervento copre l'intero processo di trasferimento d'azienda o di ramo, partendo dall'istruttoria preventiva sino alla pianificazione strategica per la corretta gestione delle **procedure di consultazione sindacale** e all'armonizzazione dei trattamenti applicati al personale interessato.

L'approccio sistematico dello Studio è costantemente orientato alla **prevenzione del rischio**, alla tutela dell'assetto organizzativo aziendale e alla gestione consapevole degli impatti economici e reputazionali connessi alle decisioni in materia di lavoro. Lo Studio fornisce altresì consulenza e difesa in giudizio in favore dei prestatori di lavoro, con una specifica e consolidata expertise dedicata alle **figure apicali e dirigenziali**.`,
    fullDescriptionEN: "The labor law department assists companies and workers in all matters relating to employment relationships. From contract drafting to dispute management, from social security advice to court defense, we offer a complete service that protects our clients' interests. We handle dismissals, union relations, collective bargaining and all issues related to industrial relations.",
    image: laborLawNewImg,
    imageAvif: laborLawNewImg,
    icon: "Users",
    isPrimary: true
  },
  {
    id: "diritto-penale",
    titleIT: "Diritto Penale e Reati d'Impresa",
    titleEN: "Criminal Law and Corporate Crime",
    shortDescriptionIT: "Difesa penale completa per privati e imprese in tutte le tipologie di reato.",
    shortDescriptionEN: "Complete criminal defense for individuals and businesses in all types of offenses.",
    fullDescriptionIT: `Lo Studio assiste persone fisiche, società e loro amministratori, in ogni fase del procedimento penale, con riguardo ad ogni tipologia di reato, con particolare esperienza nella difesa dei c.d. **"colletti bianchi"**. I professionisti dello Studio hanno maturato un'esperienza distintiva nella difesa in giudizio in materia di **reati societari, fallimentari, tributari, ambientali, finanziari**, reati contro il patrimonio, reati in materia di salute e sicurezza sul lavoro, colpa medica, diffamazione, con particolare riguardo alla **diffamazione a mezzo stampa**, nonché nei procedimenti relativi a **corruzione, concussione, turbative d'asta, peculato** e altri illeciti connessi all'attività d'impresa e ai rapporti con soggetti pubblici.

Lo Studio predilige un **approccio difensivo proattivo**, fin dalla fase delle indagini preliminari, svolgendo ove possibile **indagini difensive**, anche attraverso il coordinamento di consulenti tecnici di parte di rinomata fama, al fine di ricostruire i fatti, acquisire elementi probatori e predisporre una strategia difensiva solida e tempestiva, con l'obiettivo di minimizzare gli impatti del procedimento penale ed il rischio di applicazione di **misure cautelari personali o patrimoniali** già dalla fase delle indagini preliminari.

Lo Studio assiste inoltre le società e gli altri enti coinvolti nei procedimenti penali quali parti civili, responsabili civili o incolpati ai sensi del **d.lgs. 231/01**, coniugando la difesa nel procedimento con il supporto alla governance nell'adozione delle scelte finalizzate al **self cleaning**, alla migliore tutela dell'immagine e della continuità aziendale.

Accanto all'attività difensiva, Legalit affianca le imprese nella **prevenzione del rischio penale**, fornendo pareri pro veritate e assistenza legale qualificata a supporto delle scelte strategiche degli amministratori e degli organi di governance, al fine di valutare ex ante i profili di esposizione e mitigare il rischio di responsabilità personale e societaria.

Particolare attenzione è dedicata alla gestione degli **impatti reputazionali** connessi al procedimento penale, per la gestione dei quali lo Studio ha strutturato collaborazioni con consulenti specialisti nella **comunicazione di crisi e litigation PR**, così potendo supportare il management nella definizione di strategie di comunicazione coerenti con la linea difensiva.

L'approccio integra **competenze penalistiche, societarie e di compliance**, assicurando una gestione coordinata dei rischi legali e reputazionali connessi all'attività d'impresa.`,
    fullDescriptionEN: "The firm has consolidated experience in criminal law, offering assistance and defense in all types of criminal proceedings. Our criminal lawyers assist defendants, suspects, and victims at all stages of the proceedings, from preliminary investigations to subsequent levels of judgment. Special attention is dedicated to corporate crime, with specialized assistance for corporate, tax, bankruptcy crimes and crimes against public administration.",
    image: criminalLawImg,
    imageAvif: criminalLawImgAvif,
    icon: "Scale",
    isPrimary: true
  },
  {
    id: "diritto-civile-commerciale",
    titleIT: "Diritto Civile e Commerciale",
    titleEN: "Civil and Commercial Law",
    shortDescriptionIT: "Assistenza completa in materia civile, contrattuale e commerciale.",
    shortDescriptionEN: "Comprehensive assistance in civil, contractual and commercial matters.",
    fullDescriptionIT: `Legalit affianca le imprese nella gestione dei **rapporti contrattuali e delle dinamiche commerciali**, sia nella fase della consulenza che del contenzioso, assumendo il ruolo di **partner legale** per la crescita e la stabilità del business. Lo Studio offre consulenza e assistenza continuativa, anche attraverso formule strutturate di supporto legale, operando come vero e proprio **ufficio legale aziendale in outsourcing**, integrato nei processi decisionali e organizzativi dell'impresa.

L'attività comprende la **redazione, revisione e negoziazione di contratti commerciali** di ogni tipologia, tra cui accordi di fornitura, distribuzione, agenzia, appalto, **franchising, partnership industriali, joint venture** e condizioni generali di contratto, con particolare attenzione alla prevenzione del rischio e alla tutela degli interessi economici dell'azienda.

Sul piano contenzioso, Legalit assiste le imprese nella gestione di **controversie civili e commerciali complesse**, con clienti, fornitori o concorrenti, relative a inadempimenti contrattuali, risoluzioni, risarcimento del danno, **responsabilità professionale, responsabilità extracontrattuale, concorrenza sleale**, responsabilità da prodotto, tutela dei crediti derivanti dai rapporti commerciali.

L'assistenza nei contenziosi si svolge sia in sede stragiudiziale, attraverso attività di negoziazione e definizione di **accordi transattivi**, ma anche in sede **arbitrale** ovvero presso gli organismi di definizione alternativa delle controversie (**ADR**), sia in ambito giudiziale, con un approccio sempre orientato alla tutela del valore aziendale e alla continuità operativa dell'impresa.

Lo Studio presta inoltre assistenza giudiziale e stragiudiziale a persone fisiche e imprese in ambito civilistico, con riferimento alla tutela dei **diritti patrimoniali**, alle obbligazioni contrattuali e alla gestione delle responsabilità, garantendo un supporto qualificato e orientato alla soluzione celere ed efficace delle problematiche giuridiche.`,
    fullDescriptionEN: "Our firm offers comprehensive legal assistance in all areas of civil and commercial law. From protecting personal rights to complex contractual issues, we support our clients with competence and professionalism at every stage of the legal relationship, both in out-of-court advice and litigation. We handle disputes in matters of obligations, civil liability, consumer law and damages.",
    image: civilLawImg,
    imageAvif: civilLawImgAvif,
    icon: "Building2",
    isPrimary: true
  },
  {
    id: "corporate-compliance",
    titleIT: "Corporate Compliance, Internal Investigations e Responsabilità degli Enti ex D.Lgs. 231/01",
    titleEN: "Corporate Compliance, Internal Investigations & Entity Liability (D.Lgs. 231/01)",
    shortDescriptionIT: "Modelli organizzativi 231, investigazioni interne e prevenzione della responsabilità d'impresa.",
    shortDescriptionEN: "231 organizational models, internal investigations and corporate liability prevention.",
    fullDescriptionIT: `Legalit assiste le imprese nella progettazione, implementazione e aggiornamento di **sistemi di compliance** finalizzati alla prevenzione dei rischi legali, alla tutela della società e degli esponenti aziendali e alla definizione di assetti organizzativi adeguati a supportare lo sviluppo del business.

Lo Studio offre consulenza specialistica in materia di **responsabilità amministrativa degli enti ex D.Lgs. 231/01**, curando la redazione e l'aggiornamento dei **Modelli di Organizzazione, Gestione e Controllo**, la mappatura dei rischi, la predisposizione dei protocolli interni e l'integrazione con i sistemi di controllo esistenti.

I partner dello Studio vantano consolidata esperienza di **Presidenti e componenti di Organismi di Vigilanza**, anche in primarie società multinazionali e società partecipate pubbliche, e pertanto sono a disposizione per svolgere le funzioni di **OdV**, supportando le imprese nelle attività di monitoraggio, verifica dell'idoneità e dell'efficace attuazione dei modelli organizzativi e gestione delle segnalazioni.

L'assistenza comprende la definizione e l'implementazione di procedure **Whistleblowing** e la gestione dei relativi canali di segnalazione, assicurando conformità normativa, riservatezza e adeguata **tutela dei segnalanti**.

Lo Studio affianca inoltre le imprese nella strutturazione di progetti di **compliance integrata**, coordinando i presidi 231 con gli altri sistemi di controllo (anticorruzione, privacy, sicurezza sul lavoro, antiriciclaggio, ESG), anche svolgendo funzioni di **Compliance Officer in outsourcing**.

Particolare rilievo assume l'attività di **Internal Investigations**, svolta a supporto del management, dell'Internal Audit e degli Organismi di Vigilanza in presenza di eventi significativi quali procedimenti penali, segnalazioni di reato, violazioni del modello 231, frodi aziendali o condotte disciplinarmente rilevanti. Le indagini interne sono condotte con metodologia strutturata e indipendente e si concludono con la redazione di report utilizzabili in sede giudiziaria.

L'obiettivo è fornire all'impresa strumenti concreti per **prevenire il rischio reato**, gestire tempestivamente le criticità e rafforzare la **cultura della legalità** e della responsabilità organizzativa.`,
    fullDescriptionEN: "We offer specialized advice for the preparation, updating and verification of organizational and management models pursuant to D.Lgs. 231/2001. We assist companies in internal investigations, whistleblowing management and prevention of predicate offenses. Our team supports Supervisory Boards and provides continuous training to company staff on compliance issues.",
    image: corporateMeetingImg,
    imageAvif: corporateMeetingImgAvif,
    icon: "Building2",
    isPrimary: true
  },
  {
    id: "diritto-societario-ma",
    titleIT: "Diritto Societario e M&A",
    titleEN: "Corporate Law and M&A",
    shortDescriptionIT: "Costituzione società, operazioni straordinarie, fusioni e acquisizioni.",
    shortDescriptionEN: "Company formation, extraordinary transactions, mergers and acquisitions.",
    fullDescriptionIT: `Legalit assiste società, imprenditori, investitori e gruppi industriali nelle **operazioni societarie ordinarie e straordinarie**, nonché nella gestione e nel rafforzamento della **governance societaria**.

L'attività comprende la **costituzione di società**, la predisposizione e revisione di statuti e **patti parasociali**, la regolamentazione dei rapporti tra soci, la definizione degli assetti di governance e l'assistenza continuativa agli organi sociali.

Lo Studio fornisce supporto in operazioni di **acquisizione e cessione di partecipazioni, fusioni e scissioni**, riorganizzazioni societarie, joint venture, operazioni straordinarie funzionali a processi di crescita, consolidamento o ristrutturazione. Legalit assiste le parti in tutte le fasi dell'operazione: dalla strutturazione preliminare alla **due diligence legale**, dalla negoziazione dei contratti alla gestione del **closing e post-closing**, con un approccio integrato rispetto ai profili fiscali, finanziari, regolatori e di compliance.

Particolare rilievo assume il supporto agli organi sociali nel loro funzionamento e nelle scelte strategiche. Lo Studio, integrando competenze di **diritto societario e diritto penale societario**, affianca gli organi sociali nella valutazione preventiva dei rischi legali connessi alle decisioni gestionali, nella predisposizione di pareri e nella definizione di assetti organizzativi adeguati.

Lo Studio annovera tra i propri partner professionisti che hanno maturato consolidata esperienza come **amministratori indipendenti** e amministratori di società a partecipazione pubblica, potendo così offrire un supporto qualificato anche mediante l'assunzione di incarichi di **Consigliere d'Amministrazione indipendente**.

Lo Studio assiste inoltre in materia di **contenzioso societario**, con particolare riferimento a: impugnazione di delibere assembleari e consiliari; azioni di responsabilità nei confronti di amministratori e sindaci; conflitti tra soci e abuso di maggioranza; revoca di organi sociali; controversie in materia di patti parasociali e assetti di governance.`,
    fullDescriptionEN: "We assist national and international clients at all stages of corporate life: from incorporation to extraordinary transactions, from mergers and acquisitions to governance. Our team offers advice on shareholders' agreements, joint ventures, due diligence, acquisition contracts and corporate restructuring. We support entrepreneurs and investors in M&A transactions with a multidisciplinary approach.",
    image: corporateLawNewImg,
    imageAvif: corporateLawNewImg,
    icon: "Building2"
  },
  {
    id: "banking-finance",
    titleIT: "Banking & Finance",
    titleEN: "Banking & Finance",
    shortDescriptionIT: "Operazioni bancarie, finanziamenti strutturati e contenzioso bancario.",
    shortDescriptionEN: "Banking operations, structured financing and banking litigation.",
    fullDescriptionIT: `Legalit assiste istituti di credito, intermediari finanziari, fondi e imprese in operazioni di **finanziamento, ristrutturazione, gestione del rischio bancario e finanziario** e gestione del contenzioso.

L'attività comprende la strutturazione e negoziazione di operazioni di **finanziamento corporate e immobiliare**, finanziamenti garantiti, operazioni di **leveraged finance**, accordi di ristrutturazione del debito, nonché la predisposizione e revisione della contrattualistica bancaria e finanziaria.

Legalit offre inoltre assistenza nella gestione del **contenzioso bancario e finanziario**, nelle azioni di recupero e nella tutela del credito, nonché supporto ad istituti di credito ed intermediari finanziari su profili regolatori e di governance.

L'approccio è orientato alla **prevenzione del rischio**, alla sostenibilità delle operazioni e alla tutela della stabilità patrimoniale delle parti coinvolte.`,
    fullDescriptionEN: "Our Banking & Finance team assists banks, financial institutions, businesses and individuals in all financing operations. We offer advice on loan agreements, real and personal guarantees, securitizations, project financing and structured finance transactions. We also handle banking litigation, with particular attention to usury, compound interest and transparency of contractual terms.",
    image: bankingFinanceNewImg,
    imageAvif: bankingFinanceNewImg,
    icon: "Building2"
  },
  {
    id: "diritto-assicurazioni",
    titleIT: "Diritto delle Assicurazioni e Responsabilità Civile",
    titleEN: "Insurance Law",
    shortDescriptionIT: "Consulenza e contenzioso in materia assicurativa per compagnie e assicurati.",
    shortDescriptionEN: "Advice and litigation in insurance matters for companies and insureds.",
    fullDescriptionIT: `Lo Studio assiste **compagnie assicurative, broker, intermediari e imprese** nella gestione del contenzioso e della consulenza in materia di responsabilità civile e coperture assicurative.

L'attività comprende l'analisi e l'interpretazione delle polizze, la gestione dei **sinistri complessi**, la difesa in giudizio in materia di responsabilità contrattuale ed extracontrattuale, **responsabilità professionale, responsabilità sanitaria**, responsabilità da prodotto e danni patrimoniali ed extra patrimoniali rilevanti.

Per le imprese assicurative, lo Studio garantisce assistenza personalizzata nella **gestione strategica del contenzioso seriale e complesso**, con particolare attenzione agli impatti reputazionali e regolatori.

L'approccio integra **competenze civilistiche, societarie e, ove necessario, penalistiche**, assicurando una gestione coordinata delle esposizioni di rischio.`,
    fullDescriptionEN: "We assist insurance companies, brokers and insureds in all matters relating to insurance contracts. We offer advice on policy drafting and interpretation, claims management and insurance litigation. We handle motor liability, accidents, professional liability, D&O, life policies and all insurance branches, with particular experience in damage settlement and subrogation actions.",
    image: insuranceClaimsImg,
    imageAvif: insuranceClaimsImgAvif,
    icon: "Building2"
  },
  {
    id: "crisi-impresa",
    titleIT: "Crisi d'Impresa e Ristrutturazioni",
    titleEN: "Corporate Crisis and Restructuring",
    shortDescriptionIT: "Gestione della crisi, procedure concorsuali e piani di risanamento.",
    shortDescriptionEN: "Crisis management, insolvency proceedings and recovery plans.",
    fullDescriptionIT: `Legalit assiste imprese, imprenditori e organi societari nella gestione delle **situazioni di crisi** e nella definizione di percorsi di **risanamento e ristrutturazione**, con un approccio orientato alla **continuità aziendale** e alla tutela del valore dell'impresa.

Lo Studio affianca il management già nella fase di prima emersione degli **indici di squilibrio economico-finanziario** e nella predisposizione di adeguati assetti organizzativi ai sensi dell'art. 2086 c.c. L'integrazione con i professionisti specializzati in diritto penale societario e fallimentare e con il dipartimento di diritto del lavoro consente di supportare gli amministratori nelle scelte strategiche connesse alla prevenzione e alla gestione della crisi, riducendo l'esposizione a rischi e profili di responsabilità.

L'attività comprende l'assistenza nelle procedure di **composizione negoziata**, negli **accordi di ristrutturazione dei debiti**, nei **piani attestati di risanamento**, nei piani di ristrutturazione soggetti ad omologazione, nei **concordati preventivi** e nelle **liquidazioni giudiziali**, nonché nella gestione dei rapporti con creditori, istituti di credito e stakeholders.

Legalit supporta le imprese nella riorganizzazione societaria e finanziaria, nella rimodulazione dell'esposizione debitoria e nella negoziazione di **accordi transattivi complessi**, coordinando i profili societari, bancari, fiscali e di compliance dell'operazione.

Lo Studio presta assistenza agli amministratori e agli organi di controllo nella valutazione delle **responsabilità civili e penali** nella causazione e gestione della crisi. Accanto all'attività in favore delle imprese, Legalit fornisce supporto agli organi delle procedure concorsuali – **curatori, commissari e liquidatori** – nell'analisi delle cause della crisi, nell'individuazione di eventuali responsabilità degli amministratori e nella promozione delle conseguenti azioni di responsabilità.`,
    fullDescriptionEN: "We assist companies in difficulty in crisis management and the recovery process. We offer advice on negotiated crisis settlement, preventive arrangement, debt restructuring agreements, certified plans and judicial liquidation. We also support creditors, investors and advisors in distressed M&A transactions and corporate restructuring procedures under the Business Crisis Code.",
    image: bankruptcyImg,
    imageAvif: bankruptcyImgAvif,
    icon: "Building2"
  },
  {
    id: "recupero-crediti-npl",
    titleIT: "Gestione del Credito, NPL e Procedure Esecutive",
    titleEN: "Credit Management, NPL and Enforcement Proceedings",
    shortDescriptionIT: "Gestione crediti giudiziale e stragiudiziale, NPL e procedure esecutive.",
    shortDescriptionEN: "Judicial and extrajudicial debt recovery, NPL management and enforcement proceedings.",
    fullDescriptionIT: `Legalit assiste istituti di credito, intermediari finanziari, servicer e imprese nella **gestione, valorizzazione e recupero del credito**, sia in fase stragiudiziale sia in sede contenziosa.

Lo Studio fornisce supporto nella strutturazione e negoziazione di operazioni su portafogli **NPL e UTP**, nella gestione delle posizioni deteriorate e nelle attività di **due diligence legale** su crediti e garanzie.

L'assistenza comprende l'attivazione e la gestione di **procedure esecutive mobiliari e immobiliari**, pignoramenti, azioni cautelari, insinuazioni al passivo e **azioni revocatorie**, nonché il coordinamento con le procedure concorsuali.

L'obiettivo è massimizzare il valore del credito, ridurre i tempi di recupero e gestire in modo efficiente il **rischio legale e patrimoniale**.`,
    fullDescriptionEN: "Our team handles debt recovery activities for banks, leasing companies, businesses and individuals. We offer extrajudicial and judicial recovery services, with particular experience in movable and immovable enforcement proceedings. We assist investors and servicers in managing NPL and UTP portfolios, with an approach oriented towards maximizing recovery.",
    image: contractSigningImg,
    imageAvif: contractSigningImgAvif,
    icon: "Building2"
  },
  {
    id: "diritto-amministrativo",
    titleIT: "Diritto Amministrativo, Enti locali e Appalti Pubblici",
    titleEN: "Administrative Law, Local Authorities and Public Procurement",
    shortDescriptionIT: "Consulenza e contenzioso amministrativo, appalti pubblici e rapporti con la PA.",
    shortDescriptionEN: "Administrative advice and litigation, public procurement and relations with PA.",
    fullDescriptionIT: `Legalit assiste imprese, enti pubblici, enti locali e stazioni appaltanti nella gestione di **procedimenti amministrativi complessi** e nell'ambito della contrattualistica pubblica.

Lo Studio fornisce consulenza e assistenza in materia di **gare e appalti pubblici**, dalla fase di predisposizione della documentazione di gara alla partecipazione, fino alla gestione delle controversie innanzi al giudice amministrativo.

Per le imprese, l'attività comprende: assistenza nella partecipazione a **procedure di affidamento**; supporto nella gestione delle esclusioni, soccorsi istruttori e verifiche dei requisiti; **impugnazione di atti di gara**; consulenza nella fase esecutiva del contratto pubblico.

Per enti locali e stazioni appaltanti, Legalit offre supporto nella redazione di **bandi, disciplinari e contratti**, nella gestione delle procedure di affidamento, nella prevenzione del contenzioso e nella tutela in giudizio.

L'approccio integra competenze in materia di **anticorruzione, trasparenza, responsabilità amministrativa e governance pubblica**, assicurando un presidio completo del rischio amministrativo e contenzioso.`,
    fullDescriptionEN: "We assist public bodies, businesses and individuals in all administrative law matters. We offer advice on public procurement, concessions, authorizations and relations with the Public Administration. Our team has particular experience in litigation before administrative courts, in managing tender procedures and in defense in disciplinary and sanctioning proceedings.",
    image: adminLawNewImg,
    imageAvif: adminLawNewImg,
    icon: "Landmark"
  },
  {
    id: "responsabilita-contabile",
    titleIT: "Responsabilità Amministrativo-Contabile",
    titleEN: "Administrative-Accounting Liability",
    shortDescriptionIT: "Difesa in giudizi di responsabilità erariale davanti alla Corte dei Conti.",
    shortDescriptionEN: "Defense in fiscal liability proceedings before the Court of Auditors.",
    fullDescriptionIT: `Legalit assiste **amministratori pubblici, dirigenti, funzionari, dipendenti di enti pubblici e società partecipate** nei procedimenti innanzi alla Corte dei conti, nonché enti e amministrazioni coinvolti in giudizi di responsabilità erariale.

Lo Studio offre consulenza preventiva e difesa in materia di: **danno erariale**; responsabilità per atti di gestione; responsabilità connesse alla gestione di fondi pubblici; responsabilità in ambito societario per **società a partecipazione pubblica**.

L'attività si estende alla valutazione preventiva dei rischi connessi a scelte gestionali e procedimenti amministrativi, con particolare attenzione ai profili di legittimità, **correttezza contabile** e sostenibilità finanziaria.

L'integrazione con le practice di diritto penale d'impresa, compliance e diritto amministrativo consente una gestione coordinata delle posizioni che presentano potenziali riflessi anche sotto il profilo **penale o disciplinare**.

L'obiettivo è garantire **tutela personale e istituzionale**, riducendo l'esposizione al rischio e preservando la continuità dell'azione amministrativa.`,
    fullDescriptionEN: "We assist public officials, administrators of public bodies and private entities managing public resources in administrative-accounting liability proceedings before the Court of Auditors. We offer preventive advice on proper management of public resources and court defense in case of fiscal damage disputes, with particular attention to the responsibilities of administrators of publicly owned companies.",
    image: administrativeLawImg,
    imageAvif: administrativeLawImgAvif,
    icon: "Landmark"
  },
  {
    id: "ambiente-energia",
    titleIT: "Diritto dell'Ambiente ed Energia",
    titleEN: "Environmental Law and Energy",
    shortDescriptionIT: "Consulenza ambientale, autorizzazioni, energie rinnovabili e bonifiche.",
    shortDescriptionEN: "Environmental advice, permits, renewable energy and remediation.",
    fullDescriptionIT: `Legalit assiste imprese, enti pubblici e operatori dei settori regolati nella gestione degli **adempimenti ambientali**, nella prevenzione del rischio sanzionatorio e nella gestione del contenzioso.

Con riferimento al diritto ambientale l'attività comprende l'assistenza nei profili giuridici connessi a: **autorizzazioni ambientali (AIA, AUA e titoli abilitativi)**; gestione dei rifiuti; **bonifiche e responsabilità ambientale**; valutazioni di impatto ambientale. Lo Studio assiste inoltre imprese ed enti pubblici in procedimenti sanzionatori e contenzioso amministrativo e penale in materia ambientale.

Nel settore energia, lo Studio fornisce assistenza in materia di **autorizzazioni per impianti**, rapporti con autorità competenti, contrattualistica energetica e gestione dei profili regolatori.

Per le amministrazioni e le stazioni appaltanti, Legalit offre supporto nella gestione dei procedimenti ambientali e nella predisposizione di atti e provvedimenti complessi, garantendo coerenza normativa e prevenzione del contenzioso.

L'approccio, che integra le competenze in ambito **amministrativo, penale e compliance**, è orientato alla prevenzione del rischio, alla sostenibilità delle scelte operative e alla tutela della reputazione dell'ente o dell'impresa.`,
    fullDescriptionEN: "Our environment and energy team assists companies and operators in all environmental and energy matters. We offer advice on environmental permits (EIA, SEA, IPPC), waste management, contaminated site remediation, emissions and pollution. We support investors and developers in renewable energy projects, with particular experience in photovoltaic, wind and energy communities.",
    image: environmentalImg,
    imageAvif: environmentalImgAvif,
    icon: "Building2"
  },
  {
    id: "affari-regolatori",
    titleIT: "Regulatory & Public Affairs",
    titleEN: "Regulatory & Public Affairs",
    shortDescriptionIT: "Rapporti con le autorità di regolazione e strategie di public affairs.",
    shortDescriptionEN: "Relations with regulatory authorities and public affairs strategies.",
    fullDescriptionIT: `Legalit assiste imprese e associazioni di categoria nella gestione dei profili giuridici connessi alla **regolazione dei mercati** e ai rapporti con istituzioni, enti regolatori e **autorità di vigilanza**.

Lo Studio fornisce consulenza nell'interpretazione e applicazione di normative settoriali complesse, supportando i clienti nell'adeguamento agli **obblighi regolatori** e nella gestione dei procedimenti amministrativi. L'attività si estende all'assistenza nei rapporti con **autorità indipendenti e enti di vigilanza**, anche in sede di procedimenti autorizzativi, ispettivi e sanzionatori, mediante la predisposizione di interpelli e memorie difensive, nonché – ove necessario – attraverso l'impugnazione dei provvedimenti amministrativi innanzi alle competenti autorità giudiziarie.

Legalit assiste inoltre singole imprese e associazioni di categoria nell'analisi dell'**impatto normativo** di nuove disposizioni legislative e regolamentari sull'attività economica, elaborando soluzioni tecnico-giuridiche volte a garantire sostenibilità e coerenza sistematica degli interventi normativi.

In tale ambito, lo Studio: redige **pareri e analisi normative specialistiche**; svolge attività di **monitoraggio legislativo**; predispone osservazioni, contributi tecnici, **position paper** e note illustrative nell'ambito di consultazioni pubbliche; elabora proposte di regolamentazione, modifiche legislative ed emendamenti tecnici; supporta le associazioni di categoria nelle **audizioni presso commissioni parlamentari** e nelle interlocuzioni con i decisori pubblici nazionali ed europei.`,
    fullDescriptionEN: "We assist companies in relations with independent authorities (AGCM, ARERA, Consob, Bank of Italy, AGCOM) and in managing regulatory issues. We offer advice on regulatory compliance, sanctioning procedures, antitrust investigations and consumer protection. Our team also supports clients in public affairs strategies and institutional relations with the legislator and public administration.",
    image: parliamentBuildingImg,
    imageAvif: parliamentBuildingImgAvif,
    icon: "Landmark"
  },
  {
    id: "diritto-sport",
    titleIT: "Diritto dello Sport",
    titleEN: "Sports Law",
    shortDescriptionIT: "Assistenza ad atleti, società sportive e federazioni in materia sportiva.",
    shortDescriptionEN: "Assistance to athletes, sports clubs and federations in sports matters.",
    fullDescriptionIT: `Legalit assiste **società sportive, associazioni, enti di promozione sportiva e federazioni sportive nazionali**, nonché dirigenti, atleti e tecnici, nella gestione delle problematiche giuridiche connesse all'attività sportiva, offrendo consulenza stragiudiziale e difesa sia innanzi all'Autorità Giudiziaria sia innanzi agli **organi di giustizia sportiva**.

Lo Studio fornisce assistenza nei procedimenti innanzi agli organi di **giustizia federale e sportiva**, nonché nelle controversie relative a sanzioni disciplinari, responsabilità dei dirigenti, violazioni regolamentari, procedimenti in materia di tesseramento e rapporti associativi. I partner di Legalit hanno maturato esperienza anche quali componenti di organi di giustizia sportiva, apportando una conoscenza diretta delle dinamiche decisionali e dei criteri interpretativi applicati in ambito federale.

Particolare rilievo assume la difesa nei procedimenti in materia di **doping**, sia in ambito disciplinare sia nei connessi profili di responsabilità penale, con assistenza tecnica nella gestione delle analisi, delle controanalisi e delle attività istruttorie.

Lo Studio presta inoltre consulenza e assistenza agli enti di promozione, alle Federazioni sportive e alle associazioni e società sportive nella predisposizione di adeguati assetti organizzativi e **modelli di compliance integrata**, coniugando i presidi obbligatori in materia di **safeguarding, tutela dei minori** e prevenzione delle condotte abusive o discriminatorie, con gli altri parametri di compliance rilevanti per gli enti sportivi (231, privacy, antiriciclaggio, anticorruzione, trasparenza, sicurezza sul lavoro, legge sul lavoro sportivo, adeguamento statutario alla **riforma dello sport**, normativa sul terzo settore, ESG).

Legalit offre inoltre consulenza e assistenza nel contenzioso connesso ai **rapporti di lavoro sportivo**, con riferimento alla disciplina dei contratti di lavoro sportivo professionistico e dilettantistico, alla qualificazione dei rapporti, alla gestione dei compensi e agli adempimenti connessi alla normativa di settore.`,
    fullDescriptionEN: "Our sports law team assists professional and amateur athletes, sports clubs, federations and agents in all legal matters related to sports activities. We offer advice on sports employment contracts, transfers, sponsorships, image rights, sports justice and litigation before federal bodies, CONI and the TAS/CAS in Lausanne.",
    image: sportsLawImg,
    imageAvif: sportsLawImgAvif,
    icon: "Users"
  },
  {
    id: "diritto-tributario",
    titleIT: "Diritto Tributario",
    titleEN: "Tax Law",
    shortDescriptionIT: "Consulenza fiscale, contenzioso tributario e tax planning.",
    shortDescriptionEN: "Tax advice, tax litigation and tax planning.",
    fullDescriptionIT: `Legalit assiste imprese, imprenditori e professionisti nella gestione delle problematiche fiscali, offrendo consulenza qualificata e difesa nel **contenzioso tributario**.

L'attività comprende la consulenza in materia di **imposte dirette e indirette, fiscalità d'impresa**, accertamenti fiscali e verifiche dell'Amministrazione finanziaria, nonché il supporto nella fase precontenziosa, inclusi contraddittori, istanze di autotutela, **accertamenti con adesione e definizioni agevolate**.

Lo Studio presta assistenza nel contenzioso innanzi alle **Corti di Giustizia Tributaria** di primo e secondo grado e in sede di legittimità, con un approccio orientato alla tutela degli interessi economici dell'impresa e alla gestione strategica del rischio fiscale.

Particolare attenzione è dedicata ai profili di interazione tra **procedimento tributario e procedimento penale tributario**. Legalit vanta consolidata esperienza nella difesa in materia di **reati tributari** e assicura una gestione coordinata delle due dimensioni – amministrativa e penale – al fine di garantire coerenza difensiva, tutela degli amministratori e contenimento degli effetti patrimoniali e reputazionali.

L'integrazione tra **competenze tributarie e penalistiche** consente di affrontare in modo unitario le situazioni di maggiore complessità, anche in presenza di sequestri, misure cautelari reali e contestazioni di responsabilità nei confronti degli organi societari.`,
    fullDescriptionEN: "The tax department offers comprehensive tax assistance to companies, corporate groups and individuals. We handle ordinary advice, national and international tax planning, assessments and tax audits, tax litigation at all levels of judgment. Special attention is paid to taxation of extraordinary transactions, transfer pricing and international tax issues.",
    image: taxCrimesImg,
    imageAvif: taxCrimesImgAvif,
    icon: "Building2"
  },
  {
    id: "diritto-sanitario",
    titleIT: "Diritto Sanitario, Responsabilità Medica & Life Sciences",
    titleEN: "Healthcare Law, Medical Liability & Life Sciences",
    shortDescriptionIT: "Responsabilità medica, regolamentazione farmaceutica e life sciences.",
    shortDescriptionEN: "Medical liability, pharmaceutical regulation and life sciences.",
    fullDescriptionIT: `Legalit assiste **strutture sanitarie pubbliche e private, enti del Servizio Sanitario**, società e professionisti operanti nei settori sanitario, socio-assistenziale, farmaceutico e biomedicale, garantendo competenze specialistiche nella gestione dei peculiari profili giuridici che caratterizzano tali ambiti.

Lo Studio fornisce consulenza in materia di **organizzazione e governance delle strutture sanitarie**, accreditamento e autorizzazioni, rapporti con il Servizio Sanitario Nazionale e Regionale, contrattualistica sanitaria, gestione dei rapporti con fornitori e pazienti, nonché dei rapporti di lavoro con medici e personale sanitario.

Particolare rilievo assume l'assistenza nei procedimenti per **responsabilità medica** e degli altri professionisti sanitari, sia in sede civile sia penale. L'approccio integra valutazione tecnico-scientifica e strategia processuale, anche attraverso il coordinamento di **consulenti medico-legali** di comprovata esperienza.

Legalit presta inoltre assistenza nei procedimenti innanzi alla Corte dei conti e nelle ipotesi di **responsabilità amministrativo-contabile** connesse alla gestione delle strutture sanitarie pubbliche.

Nell'ambito **life sciences**, lo Studio supporta imprese operanti nei settori farmaceutico, biomedicale e delle tecnologie sanitarie nella gestione dei profili regolatori, nella compliance di settore e nella valutazione delle responsabilità connesse alla produzione, commercializzazione e sperimentazione di **farmaci, dispositivi medici** e tecnologie innovative.

Lo Studio può contare sull'esperienza maturata da alcuni partner in ambito istituzionale sanitario – anche con incarichi presso il **Ministero della Salute e AGENAS** – nonché in ruoli di governance e controllo all'interno di primari enti sanitari, società farmaceutiche e realtà del settore biomedicale. Tali esperienze, unite all'integrazione con le practice di diritto penale d'impresa, compliance, privacy e cybersecurity, consentono allo Studio di offrire un presidio avanzato nella gestione dei rischi legali in ambito sanitario.`,
    fullDescriptionEN: "We assist healthcare facilities, doctors, pharmaceutical companies and industry operators in all healthcare law matters. We offer advice on professional healthcare liability, medical-legal litigation, health authorizations, drug and medical device regulation. Our team has particular experience in life sciences, biotechnology and clinical trials.",
    image: healthcareDoctorsImg,
    imageAvif: healthcareDoctorsImgAvif,
    icon: "Users"
  },
  {
    id: "ia-privacy-cybersecurity",
    titleIT: "Intelligenza Artificiale, Privacy & Cybersecurity",
    titleEN: "Artificial Intelligence, Privacy & Cybersecurity",
    shortDescriptionIT: "Protezione dati personali, AI regulation e sicurezza informatica.",
    shortDescriptionEN: "Personal data protection, AI regulation and cybersecurity.",
    fullDescriptionIT: `Legalit assiste imprese ed enti pubblici nella gestione dei profili giuridici connessi al **trattamento dei dati personali**, all'adozione di sistemi di **intelligenza artificiale** e alla sicurezza delle infrastrutture digitali.

In materia di **protezione dei dati personali**, lo Studio fornisce consulenza nell'adeguamento al **Regolamento (UE) 2016/679 (GDPR)** e alla normativa nazionale, curando: mappatura dei trattamenti e predisposizione dei registri ex art. 30 GDPR; redazione e aggiornamento di informative, **policy privacy** e procedure interne; nomine e contrattualistica con responsabili del trattamento; gestione dei rapporti tra titolare, contitolari e responsabili; svolgimento di **valutazioni d'impatto sulla protezione dei dati (DPIA)**; supporto al **DPO** e agli organi di controllo interno.

Lo Studio presta assistenza nella gestione di **data breach**, nella predisposizione delle notifiche all'Autorità Garante e agli interessati, nonché nella gestione del contenzioso e dei procedimenti sanzionatori conseguenti alle attività ispettive. I professionisti dello Studio sono in grado di svolgere la funzione di **Responsabile per la Protezione dei Dati (DPO)** per società pubbliche e private, enti pubblici e PA.

Con riferimento ai sistemi di **intelligenza artificiale**, Legalit supporta le imprese nella qualificazione giuridica delle soluzioni adottate, nella valutazione dei profili di rischio e nella verifica di conformità alla normativa europea in materia di **AI Act**, con particolare riguardo a: classificazione dei sistemi in base al livello di rischio; obblighi di trasparenza e informazione; valutazione dei rischi per i diritti fondamentali; responsabilità derivanti dall'utilizzo di sistemi automatizzati.

In ambito **cybersecurity**, lo Studio assiste nella definizione di assetti organizzativi adeguati alla prevenzione degli incidenti informatici, nella predisposizione di policy di sicurezza, nella contrattualistica IT e cloud, nonché nella gestione delle responsabilità connesse ad attacchi informatici, interruzioni di servizio e perdita di dati.`,
    fullDescriptionEN: "Our team assists companies and organizations in all matters relating to personal data protection (GDPR), cybersecurity and artificial intelligence. We offer advice on privacy compliance, data protection impact assessment, data breach, international data transfers. We also support clients in compliance with the European AI Act and in managing risks related to the use of artificial intelligence systems.",
    image: cyberCrimesImg,
    imageAvif: cyberCrimesImgAvif,
    icon: "Building2"
  },
  {
    id: "real-estate",
    titleIT: "Real Estate",
    titleEN: "Real Estate",
    shortDescriptionIT: "Operazioni immobiliari, contratti, due diligence e contenzioso.",
    shortDescriptionEN: "Real estate transactions, contracts, due diligence and litigation.",
    fullDescriptionIT: `Lo Studio assiste **imprese, investitori, fondi immobiliari, società immobiliari, enti previdenziali ed enti di edilizia residenziale pubblica** nella gestione e valorizzazione di patrimoni immobiliari.

L'attività comprende la strutturazione giuridica di **operazioni immobiliari**, la redazione e negoziazione di contratti di compravendita, locazione, leasing, appalto e sviluppo immobiliare, nonché l'assistenza nella **due diligence legale** su patrimoni e singoli immobili.

Particolare rilievo assume l'assistenza nel **contenzioso immobiliare**, ove Legalit presta difesa in controversie complesse relative a contratti di locazione e godimento, appalti e responsabilità dell'appaltatore, vizi e difformità costruttive, responsabilità professionale di progettisti e direttori dei lavori, risoluzione di contratti preliminari, azioni di rilascio e sfratto, nonché **contenzioso condominiale** e azioni petitorie e possessorie.

Lo Studio assiste fondi, società immobiliari, enti pubblici, aziende di edilizia residenziale pubblica ed enti previdenziali nella gestione di **contenziosi seriali e strutturati** su patrimoni immobiliari rilevanti.

Lo Studio supporta infine i clienti nella gestione dei profili **amministrativi, urbanistici e autorizzativi** connessi agli interventi edilizi e alle operazioni di trasformazione e valorizzazione immobiliare.

L'integrazione con le practice di diritto societario, tributario, amministrativo e banking & finance consente di affrontare in modo unitario le operazioni e i conflitti connessi agli **asset immobiliari**, valutandone gli impatti patrimoniali, finanziari e reputazionali.`,
    fullDescriptionEN: "The Real Estate team assists investors, developers, real estate funds and individuals in all real estate transactions. We offer advice on sales and purchases, commercial leases, development contracts, real estate due diligence, urban planning and construction. We handle investment transactions, sale and leaseback, real estate securitizations and litigation on property, possession and real rights.",
    image: urbanPlanningImg,
    imageAvif: urbanPlanningImgAvif,
    icon: "Building2"
  },
  {
    id: "tutela-patrimoni-famiglia",
    titleIT: "Tutela dei Patrimoni, Famiglia e Successioni",
    titleEN: "Asset Protection, Family and Inheritance",
    shortDescriptionIT: "Pianificazione successoria, diritto di famiglia e protezione patrimoniale.",
    shortDescriptionEN: "Estate planning, family law and asset protection.",
    fullDescriptionIT: `Legalit assiste i Clienti nella **tutela, organizzazione e protezione del patrimonio personale e familiare**, con un approccio orientato alla prevenzione dei rischi e alla continuità generazionale.

Lo Studio offre consulenza nella **pianificazione successoria** e nella gestione dei passaggi generazionali, supportando i clienti nella definizione di assetti patrimoniali idonei a garantire stabilità, equilibrio tra gli eredi e **continuità dell'impresa familiare**.

Particolare attenzione è dedicata alla tutela del patrimonio nelle situazioni di **crisi familiare**, quali separazioni e divorzi, che possono incidere in modo significativo non solo sul patrimonio personale ma anche sugli equilibri economici e sull'assetto proprietario dell'impresa. L'assistenza è finalizzata a preservare il valore degli asset e a contenere l'impatto delle vicende personali sulla sfera imprenditoriale.

L'attività comprende la redazione di testamenti, **patti di famiglia** e strumenti di regolazione dei rapporti patrimoniali tra coniugi, nonché la strutturazione di soluzioni volte alla **protezione del patrimonio** rispetto a potenziali esposizioni debitorie o situazioni di vulnerabilità personale.

Legalit presta inoltre assistenza nelle **controversie ereditarie** e nei conflitti familiari con rilevanza patrimoniale, garantendo un approccio strategico volto alla tutela degli interessi economici e alla salvaguardia della riservatezza.`,
    fullDescriptionEN: "We assist families and individuals in protecting and transferring assets. We offer advice on estate planning, wills, trusts, family pacts, family funds and asset protection instruments. In family matters, we handle separations, divorces, child custody and maintenance allowances. Special attention is paid to generational transitions of family businesses.",
    image: familyInheritanceImg,
    imageAvif: familyInheritanceImgAvif,
    icon: "Users"
  },
  {
    id: "terzo-settore",
    titleIT: "Terzo Settore e No Profit",
    titleEN: "Third Sector and Non-Profit",
    shortDescriptionIT: "Assistenza a enti del terzo settore, fondazioni, associazioni e ONLUS.",
    shortDescriptionEN: "Assistance to third sector entities, foundations, associations and NGOs.",
    fullDescriptionIT: `Lo Studio assiste **enti del Terzo Settore, associazioni, fondazioni, imprese sociali e organizzazioni no profit** nella gestione dei profili giuridici, organizzativi e di governance connessi alla loro attività, offrendo un supporto strutturato e orientato alla vocazione etica di tali enti.

Lo Studio fornisce consulenza nella costituzione e nell'**adeguamento statutario** degli enti, nella gestione dei rapporti con il **RUNTS** e nell'interpretazione della normativa di settore, assicurando la corretta qualificazione giuridica dell'ente e la conformità ai requisiti previsti dal **Codice del Terzo Settore**.

Particolare attenzione è dedicata ai rapporti con la Pubblica Amministrazione, anche con riferimento alla partecipazione a bandi, convenzioni e procedure di affidamento, nonché alla gestione di **finanziamenti e contributi pubblici**.

Lo Studio presta assistenza agli organi direttivi nella valutazione e gestione dei profili di responsabilità penale, civile e patrimoniale degli amministratori, con particolare riguardo alla corretta gestione dei fondi, al rispetto degli obblighi di legge e alla prevenzione di situazioni di conflitto o di mala gestio.

Un ambito centrale dell'attività è rappresentato dallo sviluppo di **progetti di compliance integrata**, che includono la predisposizione e l'aggiornamento di modelli organizzativi ex **D.Lgs. 231/01**, la strutturazione dei sistemi di controllo interno, procedure **whistleblowing**, presidi in materia di anticorruzione e trasparenza, l'adeguamento al Codice del Terzo Settore, nonché i profili di sicurezza sul lavoro, gli adempimenti in materia di protezione dei dati personali e privacy, nonché l'integrazione di principi **ESG** nei processi organizzativi e decisionali dell'ente.`,
    fullDescriptionEN: "We assist third sector entities, foundations, associations, NGOs, social enterprises and voluntary organizations in all legal matters related to their activities. We offer advice on incorporation and governance, compliance with the Third Sector Code, tax benefits, fundraising, social bonus and relations with public administration. We also support entities in managing activities of general interest and extraordinary transactions.",
    image: solidarityNonprofitImg,
    imageAvif: solidarityNonprofitImgAvif,
    icon: "Users"
  }
];

// Mapping from professional specialization IDs to practice area page IDs
// This maps professional specializations (as stored in data.ts) to their corresponding practice area pages
// All areas are explicitly mapped for consistency and maintainability
export const specializationToAreaId: Record<string, string> = {
  // Direct 1:1 mappings (same ID)
  "diritto-lavoro": "diritto-lavoro",
  "diritto-penale": "diritto-penale",
  "corporate-compliance": "corporate-compliance",
  "diritto-civile-commerciale": "diritto-civile-commerciale",
  "diritto-societario-ma": "diritto-societario-ma",
  "banking-finance": "banking-finance",
  "diritto-assicurazioni": "diritto-assicurazioni",
  "crisi-impresa": "crisi-impresa",
  "diritto-amministrativo": "diritto-amministrativo",
  "responsabilita-contabile": "responsabilita-contabile",
  "ambiente-energia": "ambiente-energia",
  "affari-regolatori": "affari-regolatori",
  "diritto-sport": "diritto-sport",
  "diritto-tributario": "diritto-tributario",
  "diritto-sanitario": "diritto-sanitario",
  "real-estate": "real-estate",
  "terzo-settore": "terzo-settore",
  
  // Different ID mappings (specialization ID → area page ID)
  "recupero-crediti": "recupero-crediti-npl",
  "tutela-patrimoni": "tutela-patrimoni-famiglia",
  "privacy-cybersecurity": "ia-privacy-cybersecurity",
  "diritto-ambiente": "ambiente-energia",
};

// Inverse mapping: from practice area page IDs to professional specialization IDs
// Auto-generated from specializationToAreaId
export const areaIdToSpecializations: Record<string, string[]> = {};

// Build inverse mapping automatically
Object.entries(specializationToAreaId).forEach(([specId, areaId]) => {
  if (!areaIdToSpecializations[areaId]) {
    areaIdToSpecializations[areaId] = [];
  }
  areaIdToSpecializations[areaId].push(specId);
});

// Add self-mappings for areas that don't need translation
practiceAreasEnhanced.forEach(area => {
  if (!areaIdToSpecializations[area.id]) {
    areaIdToSpecializations[area.id] = [area.id];
  }
});

// Function to get the correct area ID for linking (specId -> areaId)
export function getAreaIdForLink(specId: string): string {
  return specializationToAreaId[specId] || specId;
}

// Function to get specialization IDs that match an area page ID (areaId -> specIds)
export function getSpecIdsForArea(areaId: string): string[] {
  return areaIdToSpecializations[areaId] || [areaId];
}

// Function to check if a professional's specialization matches an area
export function professionalMatchesArea(professionalSpecs: string[] | null | undefined, areaId: string): boolean {
  if (!professionalSpecs || professionalSpecs.length === 0) return false;
  const matchingSpecIds = getSpecIdsForArea(areaId);
  return professionalSpecs.some(spec => matchingSpecIds.includes(spec) || spec === areaId);
}

// Function to get practice area info by specialization ID
export function getPracticeAreaBySpecId(specId: string): PracticeArea | undefined {
  const areaId = getAreaIdForLink(specId);
  return practiceAreasEnhanced.find(a => a.id === areaId);
}

// Get all valid specialization IDs (for filtering/validation)
export function getAllSpecializationIds(): string[] {
  const areaIds = practiceAreasEnhanced.map(a => a.id);
  const specIds = Object.keys(specializationToAreaId);
  return Array.from(new Set([...areaIds, ...specIds]));
}
