import { useLanguage } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

export default function Cookies() {
  const { language } = useLanguage();

  const content = language === "it" ? {
    title: "Cookie Policy",
    subtitle: "Informativa sull'utilizzo dei cookie",
    intro: "Questa Cookie Policy descrive cosa sono i cookie e come vengono utilizzati sul sito web di Legalit Società tra Avvocati, in conformità con la normativa europea e italiana in materia di protezione dei dati personali.",
    sections: [
      {
        title: "1. Cosa sono i Cookie",
        content: "I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente durante la navigazione. Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente e per fornire informazioni ai proprietari del sito."
      },
      {
        title: "2. Cookie Tecnici",
        content: "Sono cookie necessari per il corretto funzionamento del sito. Includono:\n• Cookie di sessione: permettono di navigare nel sito e utilizzarne le funzionalità\n• Cookie di preferenza: memorizzano le preferenze dell'utente (es. lingua)\n• Cookie di sicurezza: proteggono la sicurezza del sito"
      },
      {
        title: "3. Cookie Analitici",
        content: "Utilizziamo cookie analitici per raccogliere informazioni aggregate sull'utilizzo del sito, come il numero di visitatori e le pagine più visitate. Questi dati ci aiutano a migliorare il sito e l'esperienza utente."
      },
      {
        title: "4. Cookie di Terze Parti",
        content: "Il nostro sito potrebbe contenere link a siti di terze parti o incorporare contenuti da altri servizi (es. Google Maps). Questi servizi potrebbero installare propri cookie, sui quali non abbiamo controllo diretto."
      },
      {
        title: "5. Gestione dei Cookie",
        content: "Puoi gestire le preferenze sui cookie attraverso le impostazioni del tuo browser. La maggior parte dei browser permette di:\n• Bloccare tutti i cookie\n• Accettare solo cookie dal sito visitato\n• Ricevere un avviso prima che un cookie venga salvato\n• Eliminare i cookie esistenti\n\nNota: bloccare alcuni cookie potrebbe influire sul funzionamento del sito."
      },
      {
        title: "6. Cookie Utilizzati",
        content: "Di seguito l'elenco dei cookie utilizzati dal nostro sito:\n\n• session_id (tecnico): gestisce la sessione utente - Durata: sessione\n• language (preferenza): memorizza la lingua scelta - Durata: 1 anno\n• theme (preferenza): memorizza il tema scelto - Durata: 1 anno\n• cookie_consent (tecnico): memorizza il consenso ai cookie - Durata: 1 anno"
      },
      {
        title: "7. Aggiornamenti",
        content: "Questa Cookie Policy può essere aggiornata periodicamente. Ti invitiamo a consultare questa pagina regolarmente per essere informato su eventuali modifiche."
      },
      {
        title: "8. Contatti",
        content: "Per qualsiasi domanda relativa all'utilizzo dei cookie sul nostro sito, puoi contattarci all'indirizzo: privacy@legalit.it"
      }
    ],
    lastUpdate: "Ultimo aggiornamento: Gennaio 2026"
  } : {
    title: "Cookie Policy",
    subtitle: "Information on the use of cookies",
    intro: "This Cookie Policy describes what cookies are and how they are used on the Legalit Società tra Avvocati website, in compliance with European and Italian data protection regulations.",
    sections: [
      {
        title: "1. What are Cookies",
        content: "Cookies are small text files that websites save on the user's device during browsing. They are widely used to make websites work more efficiently and to provide information to site owners."
      },
      {
        title: "2. Technical Cookies",
        content: "These are cookies necessary for the correct functioning of the site. They include:\n• Session cookies: allow you to navigate the site and use its features\n• Preference cookies: store user preferences (e.g., language)\n• Security cookies: protect site security"
      },
      {
        title: "3. Analytical Cookies",
        content: "We use analytical cookies to collect aggregated information about site usage, such as the number of visitors and most visited pages. This data helps us improve the site and user experience."
      },
      {
        title: "4. Third-Party Cookies",
        content: "Our site may contain links to third-party sites or embed content from other services (e.g., Google Maps). These services may install their own cookies, over which we have no direct control."
      },
      {
        title: "5. Cookie Management",
        content: "You can manage cookie preferences through your browser settings. Most browsers allow you to:\n• Block all cookies\n• Accept only cookies from the site visited\n• Receive a warning before a cookie is saved\n• Delete existing cookies\n\nNote: blocking some cookies may affect site functionality."
      },
      {
        title: "6. Cookies Used",
        content: "Below is the list of cookies used by our site:\n\n• session_id (technical): manages user session - Duration: session\n• language (preference): stores chosen language - Duration: 1 year\n• theme (preference): stores chosen theme - Duration: 1 year\n• cookie_consent (technical): stores cookie consent - Duration: 1 year"
      },
      {
        title: "7. Updates",
        content: "This Cookie Policy may be updated periodically. We invite you to check this page regularly to be informed of any changes."
      },
      {
        title: "8. Contact",
        content: "For any questions regarding the use of cookies on our site, you can contact us at: privacy@legalit.it"
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
