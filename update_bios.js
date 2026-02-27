const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  // Passalacqua
  const passalacquaBio = `Luigi Passalacqua si occupa prevalentemente di diritto del lavoro, sindacale e della previdenza sociale, sia in ambito di consulenza stragiudiziale (contrattualistica e negoziazione; gestione del rapporto di lavoro, anche di natura dirigenziale; sicurezza del lavoro; assistenza nelle procedure di riorganizzazione e trasferimento d'azienda, riduzione del personale, outsourcing, dismissione o acquisizione di attività), sia di assistenza giudiziale.

Dopo un'esperienza di diversi anni presso uno studio legale italiano operante a livello internazionale, dal 2010 è partner fondatore dello Studio.

È avvocato fiduciario e consulente di numerosi enti e società pubbliche e private, enti locali ed associazioni di categoria, nonché arbitro in procedure di conciliazione.

Laureato in Giurisprudenza presso l'Università di Roma Tre, ha poi conseguito il diploma presso il Master di secondo livello in discipline del lavoro, sindacali e della sicurezza sociale presso l'Università Tor Vergata di Roma e il diploma della Scuola di specializzazione per le professioni legali dell'Università di Roma Tre.

È iscritto all'Ordine degli Avvocati di Roma ed è socio dell'AGI (Avvocati Giuslavoristi Italiani) e di AIDLaSS Forense (Associazione italiana forense di Diritto del Lavoro e della Sicurezza sociale).

Parla l'inglese e lo spagnolo, appresi durante diversi periodi di permanenza all'estero.`;

  const passalacquaEdu = ['Laurea in Giurisprudenza - Università di Roma Tre', 'Master di secondo livello in discipline del lavoro - Università Tor Vergata', 'Scuola di specializzazione per le professioni legali - Università di Roma Tre'];

  await pool.query(`UPDATE professionals SET full_bio = $1, education = $2, updated_at = NOW() WHERE name = 'Avv. Luigi Passalacqua'`, [passalacquaBio, passalacquaEdu]);
  console.log('Passalacqua updated');

  // Iafrate
  const iafrateBio = `Claudio Iafrate è avvocato del Foro di Roma iscritto all'Albo dell'Ordine degli Avvocati di Roma dal 2016.

Opera nel diritto civile con un'impostazione orientata alla gestione del contenzioso e del rischio legale per privati, imprese e professionisti. La sua attività si concentra sulla consulenza e contrattualistica in ambito societario e assicurativo, nonché sul recupero crediti ed esecuzioni mobiliari e immobiliari, con attenzione agli aspetti concreti che incidono su tempi, costi e risultati.

È iscritto presso le liste dei Professionisti Delegati alle vendite immobiliari e Custode Giudiziario presso il Tribunale di Roma nonché è inserito nelle liste dei difensori d'ufficio presso il Tribunale di Roma.

In ambito societario segue la redazione e negoziazione dei contratti commerciali e assiste nelle controversie tra soci, società e controparti, intervenendo sia nella fase preventiva (assetto dei rapporti e clausole di tutela) sia nella fase patologica (inadempimenti, responsabilità e azioni giudiziali). In ambito assicurativo affianca il cliente nella gestione di vertenze relative a coperture e sinistri, curando l'istruttoria e trattative e, quando necessario, l'azione giudiziale.

Nel settore esecutivo e immobiliare integra la dimensione contrattuale con quella processuale, assistendo nella contrattualistica collegata a diritti reali e alle vicende dell'immobile e, in caso di inadempimento, nella tutela per il rilascio e il recupero del bene. Segue inoltre le procedure esecutive e le questioni incidentali che possono emergere nel corso della procedura. Si occupa di contenzioso condominiale, affiancando amministratori, condomìni e singoli partecipanti nella gestione e risoluzione delle controversie.

Affianca a tali ambiti una competenza specifica in diritto d'autore, maturata in consulenze per artisti musicali e per produzioni cinematografiche e audiovisive, con particolare riguardo alla contrattualistica, alle licenze e alla tutela dei diritti di utilizzazione economica. Svolge inoltre consulenza contrattuale per lo sviluppo di app e siti web, predisponendo accordi con sviluppatori e fornitori e la documentazione essenziale di esercizio.

Nel 2013 ha conseguito la Laurea presso l'Università degli Studi di Roma Tre con tesi in diritto cinese ("L'arbitrato nella Repubblica Popolare Cinese"), approfondendo i profili procedurali delle ADR nel contesto successivo all'ingresso della Cina nella WTO.`;

  await pool.query(`UPDATE professionals SET full_bio = $1, updated_at = NOW() WHERE name = 'Avv. Claudio Iafrate'`, [iafrateBio]);
  console.log('Iafrate updated');

  // Ferrara
  const ferraraBio = `Lorenzo Ferrara si occupa prevalentemente di diritto penale, con specifica esperienza sia in ambito giudiziale sia nell'attività di consulenza penal-preventiva d'impresa. In ambito giudiziale ha maturato significativa esperienza nei reati tributari, fallimentari, societari, contro la P.A., contro il patrimonio e ambientali. In ambito consulenziale ha maturato significativa esperienza in diritto penale di impresa e compliance aziendale, con focus sulla responsabilità degli enti ex d.lgs. 231/01 e sulla normativa anticorruzione, antiriciclaggio e privacy, contribuendo al costante monitoraggio delle novità normative in materia ed alla redazione e aggiornamento di modelli di organizzazione, gestione e controllo ex d.lgs. 231/2001 ed all'implementazione di progetti di compliance integrata.

È membro di Organismi di Vigilanza ex d.lgs. 231/01 di società operanti in diversi settori produttivi.

Ha conseguito il Master breve Diritto Penale d'Impresa presso Medichini Clodio Formazione nel 2022 e ha partecipato al ciclo di seminari La difesa tributaria dal tributario al processo penale tenuto dall'Associazione Centro di Diritto Penale Tributario nel 2024.

Dopo la laurea, conseguita presso l'Università degli Studi di Roma Tre con una tesi in diritto costituzionale regionale dal titolo "Il dialogo tra amministrazioni nella fase governativa del controllo di legittimità costituzionale delle leggi regionali", ha maturato una prima esperienza nel diritto civile e penale presso un affermato studio legale di Roma.

Nel 2017 ha lavorato presso la Presidenza del Consiglio dei Ministri – Dipartimento per gli Affari Regionali, nell'ufficio competente per il controllo di legittimità delle leggi regionali e delle relative modifiche statutarie.

Dal 2019 collabora con Studio Legalit.

È avvocato dal gennaio 2022 ed è iscritto all'Ordine degli Avvocati di Roma.`;

  const ferraraEdu = ['Laurea in Giurisprudenza - Università degli Studi di Roma Tre', "Master breve Diritto Penale d'Impresa - Medichini Clodio Formazione (2022)"];

  await pool.query(`UPDATE professionals SET full_bio = $1, education = $2, updated_at = NOW() WHERE name = 'Avv. Lorenzo Ferrara'`, [ferraraBio, ferraraEdu]);
  console.log('Ferrara updated');

  await pool.end();
  console.log('All done');
}
run().catch(e => { console.error(e); process.exit(1); });
