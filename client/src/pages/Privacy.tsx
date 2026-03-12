import { useLanguage } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

export default function Privacy() {
  const { language } = useLanguage();

  const content = language === "it" ? {
    title: "Privacy Policy",
    subtitle: "Informativa sul trattamento dei dati personali",
    intro: "La presente informativa è resa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR) e descrive le modalità di trattamento dei dati personali degli utenti che consultano il sito web di Legalit Società tra Avvocati.",
    sections: [
      {
        title: "1. Titolare del Trattamento",
        content: "Il Titolare del trattamento è LEGALIT SOCIETA' TRA AVVOCATI S.R.L., con sede legale in Via Filippo Corridoni, 19 — 00195 Roma.\nC.F. / P. IVA: 18365621004\n\nPer qualsiasi richiesta relativa al trattamento dei dati personali è possibile contattare il Titolare all'indirizzo email: privacy@legalit.it"
      },
      {
        title: "2. Dati Raccolti",
        content: "Il sito raccoglie i seguenti dati personali:\n• Dati di navigazione: indirizzo IP, browser utilizzato, pagine visitate\n• Dati forniti volontariamente: nome, email, telefono e messaggio inviati tramite il form di contatto\n• Dati per l'iscrizione alla newsletter: indirizzo email"
      },
      {
        title: "3. Finalità del Trattamento",
        content: "I dati personali sono trattati per le seguenti finalità:\n• Rispondere alle richieste di informazioni e consulenza\n• Inviare comunicazioni relative ai servizi dello studio\n• Gestire l'iscrizione alla newsletter\n• Adempiere agli obblighi di legge"
      },
      {
        title: "4. Base Giuridica",
        content: "Il trattamento dei dati si fonda sul consenso dell'interessato e/o sulla necessità di eseguire misure precontrattuali o contrattuali su richiesta dell'interessato."
      },
      {
        title: "5. Conservazione dei Dati",
        content: "I dati personali saranno conservati per il tempo strettamente necessario al perseguimento delle finalità per cui sono stati raccolti e comunque non oltre 24 mesi dalla raccolta, salvo diversi obblighi di legge."
      },
      {
        title: "6. Diritti dell'Interessato",
        content: "L'interessato ha diritto di:\n• Accedere ai propri dati personali\n• Ottenere la rettifica o la cancellazione dei dati\n• Opporsi al trattamento\n• Richiedere la limitazione del trattamento\n• Richiedere la portabilità dei dati\n• Revocare il consenso in qualsiasi momento\n• Proporre reclamo all'Autorità Garante per la protezione dei dati personali"
      },
      {
        title: "7. Trasferimento dei Dati",
        content: "I dati personali non vengono trasferiti a paesi terzi al di fuori dell'Unione Europea."
      },
      {
        title: "8. Contatti",
        content: "Per esercitare i propri diritti o per qualsiasi informazione relativa al trattamento dei dati personali, è possibile contattare il Titolare all'indirizzo: privacy@legalit.it"
      }
    ],
    lastUpdate: "Ultimo aggiornamento: Gennaio 2026"
  } : {
    title: "Privacy Policy",
    subtitle: "Information on the processing of personal data",
    intro: "This privacy policy is provided pursuant to Article 13 of EU Regulation 2016/679 (GDPR) and describes how personal data of users visiting the Legalit Società tra Avvocati website is processed.",
    sections: [
      {
        title: "1. Data Controller",
        content: "The Data Controller is LEGALIT SOCIETA' TRA AVVOCATI S.R.L., with registered office at Via Filippo Corridoni, 19 — 00195 Rome, Italy.\nTax Code / VAT No.: 18365621004\n\nFor any request regarding the processing of personal data, you can contact the Controller at: privacy@legalit.it"
      },
      {
        title: "2. Data Collected",
        content: "The website collects the following personal data:\n• Navigation data: IP address, browser used, pages visited\n• Voluntarily provided data: name, email, phone and message sent via the contact form\n• Newsletter subscription data: email address"
      },
      {
        title: "3. Purposes of Processing",
        content: "Personal data is processed for the following purposes:\n• Responding to information and consultation requests\n• Sending communications about the firm's services\n• Managing newsletter subscriptions\n• Complying with legal obligations"
      },
      {
        title: "4. Legal Basis",
        content: "Data processing is based on the consent of the data subject and/or the necessity to carry out pre-contractual or contractual measures at the request of the data subject."
      },
      {
        title: "5. Data Retention",
        content: "Personal data will be kept for the time strictly necessary to pursue the purposes for which it was collected and in any case no longer than 24 months from collection, unless otherwise required by law."
      },
      {
        title: "6. Data Subject Rights",
        content: "The data subject has the right to:\n• Access their personal data\n• Obtain rectification or deletion of data\n• Object to processing\n• Request limitation of processing\n• Request data portability\n• Withdraw consent at any time\n• Lodge a complaint with the Data Protection Authority"
      },
      {
        title: "7. Data Transfer",
        content: "Personal data is not transferred to third countries outside the European Union."
      },
      {
        title: "8. Contact",
        content: "To exercise your rights or for any information regarding the processing of personal data, you can contact the Controller at: privacy@legalit.it"
      }
    ],
    lastUpdate: "Last updated: January 2026"
  };

  return (
    <>
      <PageHeader 
        title={content.title}
        description={content.subtitle}
      />
      <section className="py-20">
        <div className="w-full max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            {content.intro}
          </p>
          
          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-semibold text-foreground mb-4">{section.title}</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
            {content.lastUpdate}
          </p>
        </div>
      </section>
    </>
  );
}
