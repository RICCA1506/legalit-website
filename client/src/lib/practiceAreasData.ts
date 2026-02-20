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
    fullDescriptionIT: "Il dipartimento di diritto del lavoro assiste imprese e lavoratori in tutte le questioni attinenti al rapporto di lavoro. Dalla redazione dei contratti alla gestione delle controversie, dalla consulenza in materia previdenziale alla difesa in giudizio, offriamo un servizio completo che tutela gli interessi dei nostri clienti. Gestiamo licenziamenti, relazioni sindacali, contrattazione collettiva e tutte le problematiche connesse alle relazioni industriali.",
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
    fullDescriptionIT: "Lo studio vanta una consolidata esperienza nel diritto penale, offrendo assistenza e difesa in ogni tipologia di procedimento penale. I nostri avvocati penalisti assistono imputati, indagati e parti offese in tutte le fasi del procedimento, dalle indagini preliminari fino ai gradi successivi di giudizio. Particolare attenzione viene dedicata ai reati d'impresa, con assistenza specializzata per reati societari, tributari, fallimentari e contro la pubblica amministrazione.",
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
    fullDescriptionIT: "Il nostro studio offre assistenza legale completa in tutti gli ambiti del diritto civile e commerciale. Dalla tutela dei diritti della persona alle complesse questioni contrattuali, accompagniamo i nostri clienti con competenza e professionalità in ogni fase del rapporto giuridico, sia nella consulenza stragiudiziale che nel contenzioso. Gestiamo controversie in materia di obbligazioni, responsabilità civile, diritto dei consumatori e risarcimento danni.",
    fullDescriptionEN: "Our firm offers comprehensive legal assistance in all areas of civil and commercial law. From protecting personal rights to complex contractual issues, we support our clients with competence and professionalism at every stage of the legal relationship, both in out-of-court advice and litigation. We handle disputes in matters of obligations, civil liability, consumer law and damages.",
    image: civilLawImg,
    imageAvif: civilLawImgAvif,
    icon: "Building2",
    isPrimary: true
  },
  {
    id: "corporate-compliance",
    titleIT: "Corporate Compliance, Internal Investigations & Responsabilità degli Enti ex D.Lgs. 231/01",
    titleEN: "Corporate Compliance, Internal Investigations & Entity Liability (D.Lgs. 231/01)",
    shortDescriptionIT: "Modelli organizzativi 231, investigazioni interne e prevenzione della responsabilità d'impresa.",
    shortDescriptionEN: "231 organizational models, internal investigations and corporate liability prevention.",
    fullDescriptionIT: "Offriamo consulenza specializzata per la predisposizione, l'aggiornamento e la verifica di modelli di organizzazione e gestione ai sensi del D.Lgs. 231/2001. Assistiamo le aziende nelle investigazioni interne, nella gestione delle whistleblowing e nella prevenzione dei reati presupposto. Il nostro team supporta gli Organismi di Vigilanza e fornisce formazione continua al personale aziendale sui temi della compliance.",
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
    fullDescriptionIT: "Assistiamo clienti nazionali e internazionali in tutte le fasi della vita societaria: dalla costituzione alle operazioni straordinarie, dalle fusioni e acquisizioni alla governance. Il nostro team offre consulenza su patti parasociali, joint venture, due diligence, contratti di acquisizione e ristrutturazioni societarie. Supportiamo imprenditori e investitori nelle operazioni di M&A con un approccio multidisciplinare.",
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
    fullDescriptionIT: "Il nostro team Banking & Finance assiste banche, istituti finanziari, imprese e privati in tutte le operazioni di finanziamento. Offriamo consulenza su contratti di finanziamento, garanzie reali e personali, cartolarizzazioni, project financing e operazioni di finanza strutturata. Gestiamo inoltre il contenzioso bancario, con particolare attenzione ai temi dell'usura, dell'anatocismo e della trasparenza delle condizioni contrattuali.",
    fullDescriptionEN: "Our Banking & Finance team assists banks, financial institutions, businesses and individuals in all financing operations. We offer advice on loan agreements, real and personal guarantees, securitizations, project financing and structured finance transactions. We also handle banking litigation, with particular attention to usury, compound interest and transparency of contractual terms.",
    image: bankingFinanceNewImg,
    imageAvif: bankingFinanceNewImg,
    icon: "Building2"
  },
  {
    id: "diritto-assicurazioni",
    titleIT: "Diritto Assicurativo e Responsabilità Civile",
    titleEN: "Insurance Law",
    shortDescriptionIT: "Consulenza e contenzioso in materia assicurativa per compagnie e assicurati.",
    shortDescriptionEN: "Advice and litigation in insurance matters for companies and insureds.",
    fullDescriptionIT: "Assistiamo compagnie assicurative, broker e assicurati in tutte le questioni relative ai contratti di assicurazione. Offriamo consulenza sulla redazione e interpretazione delle polizze, sulla gestione dei sinistri e sul contenzioso assicurativo. Trattiamo responsabilità civile auto, infortuni, RC professionale, D&O, polizze vita e tutti i rami assicurativi, con particolare esperienza nella liquidazione dei danni e nelle azioni di rivalsa.",
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
    fullDescriptionIT: "Assistiamo imprese in difficoltà nella gestione della crisi e nel percorso di risanamento. Offriamo consulenza su composizione negoziata della crisi, concordato preventivo, accordi di ristrutturazione dei debiti, piani attestati e liquidazione giudiziale. Supportiamo inoltre creditori, investitori e advisor nelle operazioni di distressed M&A e nelle procedure di ristrutturazione aziendale secondo il Codice della Crisi d'Impresa.",
    fullDescriptionEN: "We assist companies in difficulty in crisis management and the recovery process. We offer advice on negotiated crisis settlement, preventive arrangement, debt restructuring agreements, certified plans and judicial liquidation. We also support creditors, investors and advisors in distressed M&A transactions and corporate restructuring procedures under the Business Crisis Code.",
    image: bankruptcyImg,
    imageAvif: bankruptcyImgAvif,
    icon: "Building2"
  },
  {
    id: "recupero-crediti-npl",
    titleIT: "Gestione Crediti, NPL e Procedure Esecutive",
    titleEN: "Credit Management, NPL and Enforcement Proceedings",
    shortDescriptionIT: "Gestione crediti giudiziale e stragiudiziale, NPL e procedure esecutive.",
    shortDescriptionEN: "Judicial and extrajudicial debt recovery, NPL management and enforcement proceedings.",
    fullDescriptionIT: "Il nostro team gestisce attività di recupero crediti per banche, società di leasing, imprese e privati. Offriamo servizi di recupero stragiudiziale e giudiziale, con particolare esperienza nelle procedure esecutive mobiliari e immobiliari. Assistiamo investitori e servicer nella gestione di portafogli NPL (Non Performing Loans) e UTP (Unlikely to Pay), con un approccio orientato alla massimizzazione del recupero.",
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
    fullDescriptionIT: "Assistiamo enti pubblici, imprese e privati in tutte le questioni di diritto amministrativo. Offriamo consulenza su appalti pubblici, concessioni, autorizzazioni e rapporti con la Pubblica Amministrazione. Il nostro team ha particolare esperienza nel contenzioso davanti ai TAR e al Consiglio di Stato, nella gestione delle procedure di gara e nella difesa in procedimenti disciplinari e sanzionatori.",
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
    fullDescriptionIT: "Assistiamo pubblici funzionari, amministratori di enti pubblici e soggetti privati gestori di risorse pubbliche nei procedimenti di responsabilità amministrativo-contabile davanti alla Corte dei Conti. Offriamo consulenza preventiva sulla corretta gestione delle risorse pubbliche e difesa in giudizio in caso di contestazioni per danno erariale, con particolare attenzione alle responsabilità degli amministratori di società partecipate.",
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
    fullDescriptionIT: "Il nostro team ambiente ed energia assiste imprese e operatori del settore in tutte le questioni ambientali ed energetiche. Offriamo consulenza su autorizzazioni ambientali (VIA, VAS, AIA), gestione rifiuti, bonifiche di siti contaminati, emissioni e inquinamento. Supportiamo investitori e sviluppatori in progetti di energie rinnovabili, con particolare esperienza nel fotovoltaico, eolico e nelle comunità energetiche.",
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
    fullDescriptionIT: "Assistiamo imprese nei rapporti con le autorità indipendenti (AGCM, ARERA, Consob, Banca d'Italia, AGCOM) e nella gestione delle questioni regolatorie. Offriamo consulenza su compliance normativa, procedimenti sanzionatori, istruttorie antitrust e tutela del consumatore. Il nostro team supporta inoltre i clienti nelle strategie di public affairs e nei rapporti istituzionali con il legislatore e la pubblica amministrazione.",
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
    fullDescriptionIT: "Il nostro team di diritto dello sport assiste atleti professionisti e dilettanti, società sportive, federazioni e agenti in tutte le questioni giuridiche connesse all'attività sportiva. Offriamo consulenza su contratti di lavoro sportivo, trasferimenti, sponsorizzazioni, diritti d'immagine, giustizia sportiva e contenzioso davanti agli organi federali, al CONI e al TAS/CAS di Losanna.",
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
    fullDescriptionIT: "Il dipartimento tributario offre assistenza completa in materia fiscale a imprese, gruppi societari e privati. Gestiamo consulenza ordinaria, pianificazione fiscale nazionale e internazionale, accertamenti e verifiche fiscali, contenzioso tributario in tutti i gradi di giudizio. Particolare attenzione viene dedicata alla fiscalità delle operazioni straordinarie, al transfer pricing e alle problematiche di fiscalità internazionale.",
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
    fullDescriptionIT: "Assistiamo strutture sanitarie, medici, case farmaceutiche e operatori del settore in tutte le questioni di diritto sanitario. Offriamo consulenza su responsabilità professionale sanitaria, contenzioso medico-legale, autorizzazioni sanitarie, regolamentazione dei farmaci e dei dispositivi medici. Il nostro team ha particolare esperienza nel settore life sciences, biotecnologie e clinical trials.",
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
    fullDescriptionIT: "Il nostro team assiste imprese e organizzazioni in tutte le questioni relative alla protezione dei dati personali (GDPR), alla cybersecurity e all'intelligenza artificiale. Offriamo consulenza su compliance privacy, data protection impact assessment, data breach, trasferimenti internazionali di dati. Supportiamo inoltre i clienti nell'adeguamento all'AI Act europeo e nella gestione dei rischi connessi all'utilizzo di sistemi di intelligenza artificiale.",
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
    fullDescriptionIT: "Il team Real Estate assiste investitori, sviluppatori, fondi immobiliari e privati in tutte le operazioni immobiliari. Offriamo consulenza su compravendite, locazioni commerciali, contratti di sviluppo, due diligence immobiliari, urbanistica ed edilizia. Gestiamo operazioni di investimento, sale and leaseback, cartolarizzazioni immobiliari e contenzioso in materia di proprietà, possesso e diritti reali.",
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
    fullDescriptionIT: "Assistiamo famiglie e privati nella protezione e trasmissione del patrimonio. Offriamo consulenza su pianificazione successoria, testamenti, trust, patti di famiglia, fondi patrimoniali e strumenti di protezione patrimoniale. In ambito familiare, gestiamo separazioni, divorzi, affidamento figli e assegni di mantenimento. Particolare attenzione viene dedicata ai passaggi generazionali delle imprese familiari.",
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
    fullDescriptionIT: "Assistiamo enti del terzo settore, fondazioni, associazioni, ONLUS, imprese sociali e organizzazioni di volontariato in tutte le questioni giuridiche connesse alla loro attività. Offriamo consulenza su costituzione e governance, adeguamento al Codice del Terzo Settore, fiscalità agevolata, fundraising, social bonus e rapporti con la pubblica amministrazione. Supportiamo inoltre gli enti nella gestione delle attività di interesse generale e nelle operazioni straordinarie.",
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
