import { useLanguage } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

export default function Terms() {
  const { language } = useLanguage();

  const content = language === "it" ? {
    title: "Termini di Servizio",
    subtitle: "Condizioni generali di utilizzo del sito",
    intro: "I presenti Termini di Servizio regolano l'utilizzo del sito web di Legalit Società tra Avvocati. Accedendo al sito, l'utente accetta integralmente le presenti condizioni.",
    sections: [
      {
        title: "1. Informazioni Generali",
        content: "Il presente sito web è di proprietà di Legalit Società tra Avvocati, studio legale con sedi in Roma, Milano, Palermo e Latina. Il sito ha finalità informative e di presentazione dei servizi offerti dallo studio."
      },
      {
        title: "2. Utilizzo del Sito",
        content: "L'utente si impegna a utilizzare il sito in conformità alla legge, ai presenti Termini e nel rispetto dell'ordine pubblico e del buon costume. È vietato:\n• Utilizzare il sito per scopi illeciti\n• Introdurre virus o altri contenuti dannosi\n• Tentare di accedere a aree riservate senza autorizzazione\n• Riprodurre i contenuti senza autorizzazione"
      },
      {
        title: "3. Proprietà Intellettuale",
        content: "Tutti i contenuti del sito (testi, immagini, loghi, grafica) sono protetti dalle leggi sul diritto d'autore e sono di proprietà esclusiva di Legalit Società tra Avvocati o dei rispettivi titolari. La riproduzione, anche parziale, è vietata senza preventiva autorizzazione scritta."
      },
      {
        title: "4. Contenuti Informativi",
        content: "Le informazioni contenute nel sito hanno carattere puramente informativo e non costituiscono in alcun modo parere legale o consulenza professionale. Per ottenere una consulenza legale è necessario contattare direttamente lo studio."
      },
      {
        title: "5. Limitazione di Responsabilità",
        content: "Legalit Società tra Avvocati non garantisce la completezza o l'esattezza delle informazioni contenute nel sito e non è responsabile per eventuali errori od omissioni. Lo studio non è inoltre responsabile per danni diretti o indiretti derivanti dall'utilizzo del sito."
      },
      {
        title: "6. Link Esterni",
        content: "Il sito può contenere link a siti web esterni. Legalit Società tra Avvocati non è responsabile dei contenuti, della privacy policy o delle pratiche di tali siti esterni."
      },
      {
        title: "7. Modifiche ai Termini",
        content: "Legalit Società tra Avvocati si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno efficaci dalla loro pubblicazione sul sito. L'uso continuato del sito dopo la pubblicazione delle modifiche costituisce accettazione delle stesse."
      },
      {
        title: "8. Legge Applicabile e Foro Competente",
        content: "I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'utilizzo del sito sarà competente in via esclusiva il Foro di Roma."
      },
      {
        title: "9. Contatti",
        content: "Per qualsiasi informazione o chiarimento sui presenti Termini, è possibile contattare lo studio all'indirizzo email: info@legalit.it"
      }
    ],
    lastUpdate: "Ultimo aggiornamento: Gennaio 2026"
  } : {
    title: "Terms of Service",
    subtitle: "General conditions of use of the website",
    intro: "These Terms of Service govern the use of the Legalit Società tra Avvocati website. By accessing the site, the user fully accepts these conditions.",
    sections: [
      {
        title: "1. General Information",
        content: "This website is owned by Legalit Società tra Avvocati, a law firm with offices in Rome, Milan, Palermo, Naples and Venice. The site has informational purposes and presents the services offered by the firm."
      },
      {
        title: "2. Use of the Site",
        content: "The user agrees to use the site in compliance with the law, these Terms and with respect for public order and morality. It is forbidden to:\n• Use the site for illegal purposes\n• Introduce viruses or other harmful content\n• Attempt to access restricted areas without authorisation\n• Reproduce content without permission"
      },
      {
        title: "3. Intellectual Property",
        content: "All site content (texts, images, logos, graphics) is protected by copyright laws and is the exclusive property of Legalit Società tra Avvocati or their respective owners. Reproduction, even partial, is prohibited without prior written authorisation."
      },
      {
        title: "4. Informational Content",
        content: "The information contained on the site is purely informational and does not constitute legal opinion or professional advice in any way. To obtain legal advice, you must contact the firm directly."
      },
      {
        title: "5. Limitation of Liability",
        content: "Legalit Società tra Avvocati does not guarantee the completeness or accuracy of the information on the site and is not responsible for any errors or omissions. The firm is also not responsible for direct or indirect damages arising from the use of the site."
      },
      {
        title: "6. External Links",
        content: "The site may contain links to external websites. Legalit Società tra Avvocati is not responsible for the content, privacy policy or practices of such external sites."
      },
      {
        title: "7. Changes to Terms",
        content: "Legalit Società tra Avvocati reserves the right to modify these Terms at any time. Changes will be effective from their publication on the site. Continued use of the site after publication of changes constitutes acceptance thereof."
      },
      {
        title: "8. Applicable Law and Jurisdiction",
        content: "These Terms are governed by Italian law. For any dispute arising from the use of the site, the Court of Rome shall have exclusive jurisdiction."
      },
      {
        title: "9. Contact",
        content: "For any information or clarification on these Terms, you can contact the firm at: info@legalit.it"
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
