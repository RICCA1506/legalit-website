import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

type Language = "it" | "en";

interface Translations {
  [key: string]: {
    it: string;
    en: string;
  };
}

const translations: Translations = {
  // Hero
  "hero.subtitle": {
    it: "Studio Legale Associato",
    en: "Associated Law Firm"
  },
  "hero.title1": {
    it: "I tuoi diritti,",
    en: "Your rights,"
  },
  "hero.title2": {
    it: "il nostro impegno",
    en: "our commitment"
  },
  "hero.description": {
    it: "Legalit nasce dall'integrazione di studi legali indipendenti per garantire ai propri clienti copertura territoriale, specializzazione e qualità nei servizi.",
    en: "Legalit was born from the integration of independent law firms to ensure our clients territorial coverage, specialisation, and quality services."
  },
  "hero.cta1": {
    it: "Richiedi Consulenza",
    en: "Request Consultation"
  },
  "hero.cta2": {
    it: "Scopri i Servizi",
    en: "Discover Our Services"
  },

  // Navigation
  "nav.home": {
    it: "Chi Siamo",
    en: "About Us"
  },
  "nav.activities": {
    it: "Attività",
    en: "Practice Areas"
  },
  "nav.professionals": {
    it: "Professionisti",
    en: "Our Team"
  },
  "nav.locations": {
    it: "Sedi",
    en: "Offices"
  },
  "nav.contact": {
    it: "Contatti",
    en: "Contact"
  },
  "nav.news": {
    it: "News",
    en: "News"
  },
  "nav.careers": {
    it: "Lavora con noi",
    en: "Careers"
  },
  "nav.contactUs": {
    it: "Contattaci",
    en: "Contact Us"
  },
  "nav.settings": {
    it: "Impostazioni",
    en: "Settings"
  },
  "nav.logout": {
    it: "Esci",
    en: "Log Out"
  },

  // Footer
  "footer.slogan": {
    it: "",
    en: ""
  },
  "footer.services": {
    it: "Servizi",
    en: "Services"
  },
  "footer.locations": {
    it: "Sedi",
    en: "Offices"
  },
  "footer.contact": {
    it: "Contatti",
    en: "Contact"
  },
  "footer.contactUs": {
    it: "Contattaci",
    en: "Contact Us"
  },
  "footer.rights": {
    it: "Tutti i diritti riservati.",
    en: "All rights reserved."
  },
  "footer.privacy": {
    it: "Privacy Policy",
    en: "Privacy Policy"
  },
  "footer.cookies": {
    it: "Cookie Policy",
    en: "Cookie Policy"
  },
  "footer.terms": {
    it: "Termini di Servizio",
    en: "Terms of Service"
  },
  "footer.login": {
    it: "Accedi",
    en: "Login"
  },
  "footer.newsletter": {
    it: "Newsletter",
    en: "Newsletter"
  },
  "footer.newsletterDescription": {
    it: "Rimani aggiornato sulle ultime novità legali.",
    en: "Stay updated on the latest legal news."
  },
  "footer.newsletterSuccess": {
    it: "Grazie per l'iscrizione!",
    en: "Thank you for subscribing!"
  },
  "footer.emailPlaceholder": {
    it: "La tua email",
    en: "Your email"
  },

  // Services
  "services.civilLaw": {
    it: "Diritto Civile",
    en: "Civil Law"
  },
  "services.criminalLaw": {
    it: "Diritto Penale",
    en: "Criminal Law"
  },
  "services.laborLaw": {
    it: "Diritto del Lavoro",
    en: "Employment Law"
  },
  "services.adminLaw": {
    it: "Diritto Amministrativo",
    en: "Administrative Law"
  },

  // QuickLinks
  "quicklinks.title": {
    it: "La vostra difesa, la nostra priorità.",
    en: "Your defence, our priority."
  },
  "quicklinks.desc1": {
    it: "Competenza e specializzazione per affrontare ogni sfida con la giusta strategia.",
    en: "Expertise and specialisation to tackle every challenge with the right strategy."
  },
  "quicklinks.desc2": {
    it: "Vicini alle vostre necessità con sedi strategiche e una reperibilità costante.",
    en: "Close to your needs with strategic locations and constant availability."
  },
  "quicklinks.activities": {
    it: "ATTIVITÀ",
    en: "PRACTICE AREAS"
  },
  "quicklinks.professionals": {
    it: "PROFESSIONISTI",
    en: "OUR TEAM"
  },
  "quicklinks.locations": {
    it: "SEDI",
    en: "OFFICES"
  },
  "quicklinks.news": {
    it: "NEWS",
    en: "NEWS"
  },
  "quicklinks.contact": {
    it: "CONTATTI",
    en: "CONTACT"
  },

  // Stats
  "stats.experience": {
    it: "Anni di Esperienza",
    en: "Years of Experience"
  },
  "stats.professionals": {
    it: "Professionisti",
    en: "Professionals"
  },
  "stats.clients": {
    it: "Clienti Assistiti",
    en: "Clients Assisted"
  },
  "stats.cases": {
    it: "Casi Risolti",
    en: "Cases Resolved"
  },
  "stats.locations": {
    it: "Sedi in Italia",
    en: "Offices in Italy"
  },

  // CTA Section
  "cta.title": {
    it: "I tuoi diritti contano,",
    en: "Your rights matter,"
  },
  "cta.title2": {
    it: "siamo qui per difenderli",
    en: "we are here to defend them"
  },
  "cta.description": {
    it: "Contattaci per sottoporci il tuo caso o richiedere consulenza.",
    en: "Contact us to submit your case or request a consultation."
  },
  "cta.button": {
    it: "Contattaci",
    en: "Contact Us"
  },
  "cta.linkedin": {
    it: "Seguici su LinkedIn",
    en: "Follow us on LinkedIn"
  },

  // Practice Areas Page
  "attivita.title": {
    it: "Aree di Attività",
    en: "Practice Areas"
  },
  "attivita.description": {
    it: "Legalit offre assistenza legale qualificata in tutti i principali settori del diritto, garantendo competenza e professionalità.",
    en: "Legalit provides qualified legal assistance across all major areas of law, ensuring expertise and professionalism."
  },
  "attivita.learnMore": {
    it: "Scopri di più",
    en: "Learn More"
  },

  // Professionals Page
  "professionisti.title": {
    it: "Professionisti",
    en: "Our Team"
  },
  "professionisti.description": {
    it: "",
    en: ""
  },
  "professionisti.all": {
    it: "Tutti",
    en: "All"
  },
  "professionisti.noResults": {
    it: "Nessun professionista trovato per questa sede.",
    en: "No professionals found for this office."
  },
  "professionisti.profile": {
    it: "Profilo",
    en: "Profile"
  },
  "professionisti.education": {
    it: "Formazione",
    en: "Education"
  },
  "professionisti.languages": {
    it: "Lingue",
    en: "Languages"
  },
  "professionisti.contact": {
    it: "Contatta",
    en: "Contact"
  },
  "professionisti.sendEmail": {
    it: "Invia Email",
    en: "Send Email"
  },
  "professionisti.call": {
    it: "Chiama",
    en: "Call"
  },
  "professionisti.viewProfile": {
    it: "Visualizza profilo di",
    en: "View profile of"
  },

  // Locations Page
  "sedi.title": {
    it: "Le Nostre Sedi",
    en: "Our Offices"
  },
  "sedi.description": {
    it: "Siamo presenti nelle principali città italiane per garantirti assistenza legale ovunque tu sia.",
    en: "We are present in major Italian cities to provide you with legal assistance wherever you are."
  },
  "sedi.phone": {
    it: "Telefono",
    en: "Phone"
  },
  "sedi.fax": {
    it: "Fax",
    en: "Fax"
  },
  "sedi.email": {
    it: "Email",
    en: "Email"
  },
  "sedi.directions": {
    it: "Indicazioni stradali",
    en: "Get Directions"
  },
  "sedi.linkedinSlogan": {
    it: "I tuoi diritti, il nostro impegno!",
    en: "Your rights, our commitment!"
  },
  "sedi.linkedinOverview": {
    it: "Studio Legale con sedi in Roma, Milano, Palermo e Latina.",
    en: "Law Firm with offices in Rome, Milan, Palermo and Latina."
  },
  "sedi.practiceAreas": {
    it: "Aree di Attività",
    en: "Practice Areas"
  },
  "sedi.officesInItaly": {
    it: "4 sedi in Italia",
    en: "4 offices in Italy"
  },
  "sedi.learnMore": {
    it: "Scopri di più",
    en: "Learn more"
  },

  // Contact Page
  "contatti.title": {
    it: "Contatti",
    en: "Contact Us"
  },
  "contatti.description": {
    it: "Siamo a tua disposizione per qualsiasi richiesta o informazione. Contattaci e ti risponderemo al più presto.",
    en: "We are at your disposal for any enquiry or information. Contact us and we will respond as soon as possible."
  },
  "contatti.directContact": {
    it: "Contatti diretti",
    en: "Direct Contact"
  },
  "contatti.phone": {
    it: "Telefono",
    en: "Phone"
  },
  "contatti.hours": {
    it: "Orari",
    en: "Hours"
  },
  "contatti.hoursValue": {
    it: "Lun-Ven: 9:30-13:00 / 14:30-19:00",
    en: "Mon-Fri: 9:30 AM - 1:00 PM / 2:30 PM - 7:00 PM"
  },
  "contatti.ourLocations": {
    it: "Le nostre sedi",
    en: "Our Offices"
  },
  "contatti.followUs": {
    it: "Seguici",
    en: "Follow Us"
  },

  // Contact Form
  "contactForm.title": {
    it: "Inviaci un messaggio",
    en: "Send us a message"
  },
  "contactForm.subtitle": {
    it: "Compila il form e ti risponderemo entro 24 ore.",
    en: "Fill out the form and we will respond within 24 hours."
  },
  "contactForm.name": {
    it: "Nome e Cognome",
    en: "Full Name"
  },
  "contactForm.namePlaceholder": {
    it: "Mario Rossi",
    en: "John Smith"
  },
  "contactForm.email": {
    it: "Email",
    en: "Email"
  },
  "contactForm.emailPlaceholder": {
    it: "mario@esempio.it",
    en: "john@example.com"
  },
  "contactForm.phone": {
    it: "Telefono",
    en: "Phone"
  },
  "contactForm.subject": {
    it: "Oggetto",
    en: "Subject"
  },
  "contactForm.subjectPlaceholder": {
    it: "Seleziona un oggetto",
    en: "Select a subject"
  },
  "contactForm.subjectConsultation": {
    it: "Richiesta consulenza",
    en: "Consultation Request"
  },
  "contactForm.subjectInfo": {
    it: "Informazioni generali",
    en: "General Information"
  },
  "contactForm.subjectCollaboration": {
    it: "Collaborazioni",
    en: "Collaborations"
  },
  "contactForm.subjectAdministrative": {
    it: "Informazioni amministrative",
    en: "Administrative Information"
  },
  "contactForm.subjectOther": {
    it: "Altro",
    en: "Other"
  },
  "contactForm.message": {
    it: "Messaggio",
    en: "Message"
  },
  "contactForm.messagePlaceholder": {
    it: "Descrivi la tua richiesta...",
    en: "Describe your enquiry..."
  },
  "contactForm.submit": {
    it: "Invia messaggio",
    en: "Send Message"
  },
  "contactForm.submitting": {
    it: "Invio in corso...",
    en: "Sending..."
  },
  "contactForm.successTitle": {
    it: "Messaggio Inviato!",
    en: "Message Sent!"
  },
  "contactForm.successMessage": {
    it: "Grazie per averci contattato. Ti risponderemo il prima possibile.",
    en: "Thank you for contacting us. We will respond as soon as possible."
  },
  "contactForm.sendAnother": {
    it: "Invia un altro messaggio",
    en: "Send Another Message"
  },
  "contactForm.toastTitle": {
    it: "Messaggio inviato",
    en: "Message sent"
  },
  "contactForm.toastDescription": {
    it: "Ti risponderemo il prima possibile.",
    en: "We will respond as soon as possible."
  },

  // Validation Messages
  "validation.nameMin": {
    it: "Il nome deve contenere almeno 2 caratteri",
    en: "Name must contain at least 2 characters"
  },
  "validation.emailInvalid": {
    it: "Inserisci un indirizzo email valido",
    en: "Please enter a valid email address"
  },
  "validation.subjectRequired": {
    it: "Seleziona un oggetto",
    en: "Please select a subject"
  },
  "validation.messageMin": {
    it: "Il messaggio deve contenere almeno 10 caratteri",
    en: "Message must contain at least 10 characters"
  },
  "validation.passwordMin": {
    it: "La password è richiesta",
    en: "Password is required"
  },
  "validation.passwordMinLength": {
    it: "La password deve avere almeno 5 caratteri",
    en: "Password must be at least 5 characters"
  },
  "validation.passwordUppercase": {
    it: "La password deve contenere almeno una lettera maiuscola",
    en: "Password must contain at least one uppercase letter"
  },
  "validation.passwordLowercase": {
    it: "La password deve contenere almeno una lettera minuscola",
    en: "Password must contain at least one lowercase letter"
  },
  "validation.passwordNumber": {
    it: "La password deve contenere almeno un numero",
    en: "Password must contain at least one number"
  },
  "validation.passwordSymbol": {
    it: "La password deve contenere almeno un simbolo",
    en: "Password must contain at least one special character"
  },
  "validation.passwordsNoMatch": {
    it: "Le password non corrispondono",
    en: "Passwords do not match"
  },
  "validation.firstNameRequired": {
    it: "Nome richiesto",
    en: "First name is required"
  },
  "validation.lastNameRequired": {
    it: "Cognome richiesto",
    en: "Last name is required"
  },

  // News Page
  "news.title": {
    it: "News",
    en: "News"
  },
  "news.description": {
    it: "Resta aggiornato sulle ultime novità del mondo legale, approfondimenti giuridici e aggiornamenti dal nostro studio. Connettiti con i nostri professionisti e scopri le nostre attività.",
    en: "Stay updated on the latest legal news, legal insights, and updates from our firm. Connect with our professionals and discover our activities."
  },
  "news.followLinkedIn": {
    it: "Seguici su LinkedIn",
    en: "Follow us on LinkedIn"
  },
  "news.linkedInDescription": {
    it: "Resta aggiornato sulle nostre attività e su ciò che cambia nel mondo legale.",
    en: "Stay updated on our activities and what is changing in the legal world."
  },
  "news.visitProfile": {
    it: "Visita il profilo",
    en: "Visit Profile"
  },
  "news.read": {
    it: "Vai su LinkedIn",
    en: "Go to LinkedIn"
  },
  "news.noArticles": {
    it: "Nessun articolo disponibile",
    en: "No Articles Available"
  },
  "news.noArticlesDescription": {
    it: "Non ci sono ancora articoli pubblicati. Torna a trovarci presto!",
    en: "There are no published articles yet. Check back soon!"
  },
  "news.createFirst": {
    it: "Crea il primo articolo",
    en: "Create First Article"
  },
  "news.studioNews": {
    it: "News dello Studio",
    en: "Firm News"
  },
  "news.studioNewsDescription": {
    it: "Aggiornamenti e comunicati dal nostro studio legale",
    en: "Updates and announcements from our law firm"
  },
  "news.legalWorld": {
    it: "News dal Mondo Giuridico",
    en: "Legal World News"
  },
  "news.legalWorldDescription": {
    it: "Novità legislative, sentenze e aggiornamenti normativi",
    en: "Legislative updates, rulings, and regulatory changes"
  },
  "news.filterByDate": {
    it: "Ordina per data",
    en: "Sort by date"
  },
  "news.newestFirst": {
    it: "Più recenti prima",
    en: "Newest first"
  },
  "news.oldestFirst": {
    it: "Meno recenti prima",
    en: "Oldest first"
  },
  "news.filterByCategory": {
    it: "Filtra per categoria",
    en: "Filter by category"
  },
  "news.allCategories": {
    it: "Tutte le categorie",
    en: "All categories"
  },
  "news.filterByBranch": {
    it: "Filtra per branca",
    en: "Filter by practice area"
  },
  "news.allBranches": {
    it: "Tutte le branche",
    en: "All practice areas"
  },
  "news.filterByPracticeArea": {
    it: "Filtra per area di attività",
    en: "Filter by practice area"
  },
  "news.allPracticeAreas": {
    it: "Tutte le aree",
    en: "All practice areas"
  },
  "news.viewOnLinkedIn": {
    it: "Vai su LinkedIn",
    en: "Go to LinkedIn"
  },
  "news.searchPlaceholder": {
    it: "Cerca articoli...",
    en: "Search articles..."
  },
  "news.latestUpdates": {
    it: "Ultime Novità",
    en: "Latest Updates"
  },
  "news.legalNewsHeading": {
    it: "News dal mondo legale",
    en: "News from the legal world"
  },
  "news.legalNewsSubtitle": {
    it: "Rimani aggiornato sulle ultime novità normative e giurisprudenziali.",
    en: "Stay updated on the latest regulatory and jurisprudential news."
  },
  "news.allNews": {
    it: "Tutte le news",
    en: "All news"
  },

  // Legal Categories - Macro
  "category.macro.civil": {
    it: "Civile",
    en: "Civil"
  },
  "category.macro.criminal": {
    it: "Penale",
    en: "Criminal"
  },
  "category.macro.administrative": {
    it: "Amministrativo",
    en: "Administrative"
  },
  "category.macro.tax": {
    it: "Tributario",
    en: "Tax"
  },
  "category.macro.business": {
    it: "D'Affari",
    en: "Business"
  },

  // Legal Categories - Micro
  "category.micro.labor": {
    it: "Lavoro e Previdenza Sociale",
    en: "Employment and Social Security"
  },
  "category.micro.taxCustoms": {
    it: "Tributario/Doganale/Fiscalità Internazionale",
    en: "Tax/Customs/International Taxation"
  },
  "category.micro.international": {
    it: "Internazionale",
    en: "International"
  },
  "category.micro.eu": {
    it: "Unione Europea",
    en: "European Union"
  },
  "category.micro.transport": {
    it: "Trasporti e Navigazione",
    en: "Transport and Navigation"
  },
  "category.micro.competition": {
    it: "Concorrenza",
    en: "Competition"
  },
  "category.micro.succession": {
    it: "Successorio",
    en: "Succession"
  },
  "category.micro.realEstate": {
    it: "Diritti Reali/Condominio/Locazioni",
    en: "Real Estate/Condominium/Leasing"
  },
  "category.micro.contracts": {
    it: "Contratti",
    en: "Contracts"
  },
  "category.micro.liability": {
    it: "Responsabilità Civile/Professionale/Assicurazioni",
    en: "Civil/Professional Liability/Insurance"
  },
  "category.micro.agricultural": {
    it: "Agrario",
    en: "Agricultural"
  },
  "category.micro.commercial": {
    it: "Commerciale e Societario",
    en: "Commercial and Corporate"
  },
  "category.micro.ip": {
    it: "Industriale/Proprietà Intellettuale/Innovazione",
    en: "Industrial/Intellectual Property/Innovation"
  },
  "category.micro.insolvency": {
    it: "Crisi d'Impresa e Insolvenza",
    en: "Business Crisis and Insolvency"
  },
  "category.micro.enforcement": {
    it: "Esecuzione Forzata",
    en: "Enforcement"
  },
  "category.micro.banking": {
    it: "Bancario e Mercati Finanziari",
    en: "Banking and Financial Markets"
  },
  "category.micro.consumer": {
    it: "Consumatori",
    en: "Consumer Law"
  },
  "category.micro.criminalPerson": {
    it: "Penale della Persona",
    en: "Personal Criminal Law"
  },
  "category.micro.criminalPA": {
    it: "Penale della PA",
    en: "Public Administration Criminal Law"
  },
  "category.micro.environment": {
    it: "Ambiente/Urbanistica/Edilizia",
    en: "Environment/Urban Planning/Construction"
  },
  "category.micro.criminalBusiness": {
    it: "Economia e Impresa",
    en: "Business and Economics"
  },
  "category.micro.organizedCrime": {
    it: "Criminalità Organizzata e Misure di Prevenzione",
    en: "Organised Crime and Prevention Measures"
  },
  "category.micro.execution": {
    it: "Esecuzione Penale",
    en: "Criminal Execution"
  },
  "category.micro.tech": {
    it: "Informazione/Internet/Nuove Tecnologie",
    en: "Information/Internet/New Technologies"
  },

  // Login Page
  "login.title": {
    it: "Accesso Partner",
    en: "Partner Login"
  },
  "login.description": {
    it: "Accedi per gestire gli articoli e le news dello studio",
    en: "Log in to manage articles and firm news"
  },
  "login.email": {
    it: "Email",
    en: "Email"
  },
  "login.password": {
    it: "Password",
    en: "Password"
  },
  "login.submit": {
    it: "Accedi",
    en: "Log In"
  },
  "login.successTitle": {
    it: "Accesso effettuato",
    en: "Login Successful"
  },
  "login.successDescription": {
    it: "Benvenuto nel pannello di gestione",
    en: "Welcome to the management panel"
  },
  "login.errorTitle": {
    it: "Errore",
    en: "Error"
  },
  "login.errorDescription": {
    it: "Email o password non corretti",
    en: "Incorrect email or password"
  },
  "login.forgotPassword": {
    it: "Password dimenticata?",
    en: "Forgot password?"
  },
  "login.orLoginWithCode": {
    it: "Oppure accedi con codice email",
    en: "Or log in with email code"
  },
  "login.backToPassword": {
    it: "Accedi con password",
    en: "Log in with password"
  },
  "login.sendCode": {
    it: "Invia codice",
    en: "Send code"
  },
  "login.sendCodeDescription": {
    it: "Inserisci la tua email per ricevere un codice di accesso",
    en: "Enter your email to receive a login code"
  },
  "login.enterCode": {
    it: "Inserisci il codice",
    en: "Enter the code"
  },
  "login.enterCodeDescription": {
    it: "Inserisci il codice a 6 cifre ricevuto via email",
    en: "Enter the 6-digit code you received by email"
  },
  "login.verifyCode": {
    it: "Verifica codice",
    en: "Verify code"
  },
  "login.codeSent": {
    it: "Codice inviato",
    en: "Code sent"
  },
  "login.codeSentDescription": {
    it: "Se l'email esiste nel sistema, riceverai un codice di accesso",
    en: "If the email exists in the system, you will receive a login code"
  },
  "login.codeError": {
    it: "Codice non valido o scaduto",
    en: "Invalid or expired code"
  },
  "login.resendCode": {
    it: "Invia nuovo codice",
    en: "Resend code"
  },

  // Forgot Password Page
  "forgotPassword.title": {
    it: "Password Dimenticata",
    en: "Forgot Password"
  },
  "forgotPassword.description": {
    it: "Inserisci la tua email per ricevere un link di reset della password",
    en: "Enter your email to receive a password reset link"
  },
  "forgotPassword.sentDescription": {
    it: "Controlla la tua casella email",
    en: "Check your email inbox"
  },
  "forgotPassword.checkEmail": {
    it: "Se l'email esiste nel sistema, riceverai un link per reimpostare la password. Controlla anche la cartella spam.",
    en: "If the email exists in our system, you will receive a password reset link. Please also check your spam folder."
  },
  "forgotPassword.submit": {
    it: "Invia Link di Reset",
    en: "Send Reset Link"
  },
  "forgotPassword.backToLogin": {
    it: "Torna al Login",
    en: "Back to Login"
  },
  "forgotPassword.errorGeneric": {
    it: "Errore durante la richiesta",
    en: "Error processing the request"
  },
  "forgotPassword.chooseMethod": {
    it: "Scegli come vuoi accedere al tuo account",
    en: "Choose how you want to access your account"
  },
  "forgotPassword.resetOption": {
    it: "Reimposta password",
    en: "Reset password"
  },
  "forgotPassword.resetOptionDesc": {
    it: "Ricevi un link via email per creare una nuova password",
    en: "Receive an email link to create a new password"
  },
  "forgotPassword.codeOption": {
    it: "Accedi con codice email",
    en: "Log in with email code"
  },
  "forgotPassword.codeOptionDesc": {
    it: "Ricevi un codice a 6 cifre per accedere senza password",
    en: "Receive a 6-digit code to log in without a password"
  },
  "forgotPassword.loginWithCode": {
    it: "Accesso con Codice",
    en: "Login with Code"
  },
  "forgotPassword.backToOptions": {
    it: "Torna alle opzioni",
    en: "Back to options"
  },

  // Reset Password Page
  "resetPassword.title": {
    it: "Reimposta Password",
    en: "Reset Password"
  },
  "resetPassword.description": {
    it: "Imposta una nuova password per",
    en: "Set a new password for"
  },
  "resetPassword.newPassword": {
    it: "Nuova Password",
    en: "New Password"
  },
  "resetPassword.requirements": {
    it: "Minimo 5 caratteri.",
    en: "Minimum 5 characters."
  },
  "resetPassword.submit": {
    it: "Reimposta Password",
    en: "Reset Password"
  },
  "resetPassword.successTitle": {
    it: "Password Reimpostata",
    en: "Password Reset"
  },
  "resetPassword.successDescription": {
    it: "La tua password è stata reimpostata con successo",
    en: "Your password has been successfully reset"
  },
  "resetPassword.invalidTitle": {
    it: "Link Non Valido",
    en: "Invalid Link"
  },
  "resetPassword.invalidDescription": {
    it: "Il link di reset è scaduto o non è valido. Richiedi un nuovo link.",
    en: "The reset link has expired or is invalid. Request a new link."
  },
  "resetPassword.requestNew": {
    it: "Richiedi Nuovo Link",
    en: "Request New Link"
  },
  "resetPassword.doneTitle": {
    it: "Password Reimpostata",
    en: "Password Reset Complete"
  },
  "resetPassword.doneDescription": {
    it: "La tua password è stata reimpostata con successo. Puoi ora accedere con la nuova password.",
    en: "Your password has been successfully reset. You can now log in with your new password."
  },
  "resetPassword.goToLogin": {
    it: "Vai al Login",
    en: "Go to Login"
  },
  "resetPassword.errorGeneric": {
    it: "Errore durante il reset della password",
    en: "Error resetting the password"
  },

  // Registration Page
  "register.title": {
    it: "Completa la Registrazione",
    en: "Complete Registration"
  },
  "register.description": {
    it: "Crea le tue credenziali per accedere al pannello di gestione",
    en: "Create your credentials to access the management panel"
  },
  "register.firstName": {
    it: "Nome",
    en: "First Name"
  },
  "register.lastName": {
    it: "Cognome",
    en: "Last Name"
  },
  "register.confirmPassword": {
    it: "Conferma Password",
    en: "Confirm Password"
  },
  "register.submit": {
    it: "Completa Registrazione",
    en: "Complete Registration"
  },
  "register.invalidInvite": {
    it: "Invito Non Valido",
    en: "Invalid Invitation"
  },
  "register.missingToken": {
    it: "Token di invito mancante. Richiedi un nuovo invito.",
    en: "Invitation token missing. Please request a new invitation."
  },
  "register.invalidToken": {
    it: "Token di invito non valido o scaduto. Richiedi un nuovo invito.",
    en: "Invalid or expired invitation token. Please request a new invitation."
  },
  "register.backHome": {
    it: "Torna alla Home",
    en: "Back to Home"
  },
  "register.successTitle": {
    it: "Registrazione completata",
    en: "Registration Complete"
  },
  "register.successDescription": {
    it: "Benvenuto nel pannello di gestione",
    en: "Welcome to the management panel"
  },
  "register.errorTitle": {
    it: "Errore",
    en: "Error"
  },
  "register.errorDescription": {
    it: "Errore durante la registrazione",
    en: "Error during registration"
  },

  // Admin Panel
  "admin.title": {
    it: "Pannello di Gestione",
    en: "Management Panel"
  },
  "admin.newsTab": {
    it: "Gestione News",
    en: "News Management"
  },
  "admin.professionalsTab": {
    it: "Gestione Professionisti",
    en: "Team Management"
  },
  "admin.invitesTab": {
    it: "Invita Partner",
    en: "Invite Partner"
  },
  "admin.categoriesTab": {
    it: "Gestione Categorie",
    en: "Category Management"
  },
  "admin.publishedArticles": {
    it: "articoli pubblicati",
    en: "published articles"
  },
  "admin.professionals": {
    it: "professionisti",
    en: "professionals"
  },
  "admin.newArticle": {
    it: "Nuovo Articolo",
    en: "New Article"
  },
  "admin.noArticles": {
    it: "Nessun articolo",
    en: "No Articles"
  },
  "admin.noArticlesDesc": {
    it: "Non hai ancora pubblicato nessun articolo. Inizia creando il tuo primo contenuto.",
    en: "You have not published any articles yet. Start by creating your first content."
  },
  "admin.createFirst": {
    it: "Crea il primo articolo",
    en: "Create First Article"
  },
  "admin.edit": {
    it: "Modifica",
    en: "Edit"
  },
  "admin.delete": {
    it: "Elimina",
    en: "Delete"
  },
  "admin.noProfessionals": {
    it: "Nessun professionista",
    en: "No Professionals"
  },
  "admin.noProfessionalsDesc": {
    it: "Non hai ancora aggiunto nessun professionista. Puoi caricare i professionisti esistenti o crearne di nuovi.",
    en: "You have not added any professionals yet. You can load existing professionals or create new ones."
  },
  "admin.loadExisting": {
    it: "Carica Professionisti Esistenti",
    en: "Load Existing Professionals"
  },
  "admin.addNew": {
    it: "Aggiungi Nuovo",
    en: "Add New"
  },
  "admin.invitePartner": {
    it: "Invita un Nuovo Partner",
    en: "Invite a New Partner"
  },
  "admin.inviteDesc": {
    it: "Inserisci l'email del partner che vuoi invitare. Riceverà un link per completare la registrazione.",
    en: "Enter the email of the partner you want to invite. They will receive a link to complete their registration."
  },
  "admin.partnerEmail": {
    it: "Email del Partner",
    en: "Partner Email"
  },
  "admin.sendInvite": {
    it: "Invia Invito",
    en: "Send Invitation"
  },
  "admin.pendingInvites": {
    it: "Inviti in Attesa",
    en: "Pending Invitations"
  },
  "admin.noPending": {
    it: "Nessun invito in attesa",
    en: "No pending invitations"
  },
  "admin.copyLink": {
    it: "Copia Link",
    en: "Copy Link"
  },
  "admin.copied": {
    it: "Copiato!",
    en: "Copied!"
  },
  "admin.deleteInvite": {
    it: "Elimina Invito",
    en: "Delete Invitation"
  },
  "admin.articleTitle": {
    it: "Titolo",
    en: "Title"
  },
  "admin.articleExcerpt": {
    it: "Estratto",
    en: "Excerpt"
  },
  "admin.articleContent": {
    it: "Contenuto",
    en: "Content"
  },
  "admin.articleCategory": {
    it: "Categoria",
    en: "Category"
  },
  "admin.articleBranch": {
    it: "Branca Giuridica",
    en: "Legal Practice Area"
  },
  "admin.articleType": {
    it: "Tipo di News",
    en: "News Type"
  },
  "admin.articleImage": {
    it: "Immagine",
    en: "Image"
  },
  "admin.articleReadTime": {
    it: "Tempo di lettura",
    en: "Reading time"
  },
  "admin.articleLinkedIn": {
    it: "Link LinkedIn",
    en: "LinkedIn Link"
  },
  "admin.saveArticle": {
    it: "Salva Articolo",
    en: "Save Article"
  },
  "admin.cancel": {
    it: "Annulla",
    en: "Cancel"
  },
  "admin.addCategory": {
    it: "Aggiungi Categoria",
    en: "Add Category"
  },
  "admin.categoryName": {
    it: "Nome Categoria",
    en: "Category Name"
  },
  "admin.macroCategories": {
    it: "Categorie Macro",
    en: "Macro Categories"
  },
  "admin.microCategories": {
    it: "Categorie Micro",
    en: "Micro Categories"
  },

  // 404 Page
  "notFound.title": {
    it: "Pagina Non Trovata",
    en: "Page Not Found"
  },
  "notFound.description": {
    it: "La pagina che stai cercando non esiste.",
    en: "The page you are looking for does not exist."
  },

  // General
  "general.loading": {
    it: "Caricamento...",
    en: "Loading..."
  },
  "general.error": {
    it: "Errore",
    en: "Error"
  },
  "general.success": {
    it: "Successo",
    en: "Success"
  },
  "general.save": {
    it: "Salva",
    en: "Save"
  },
  "general.cancel": {
    it: "Annulla",
    en: "Cancel"
  },
  "general.close": {
    it: "Chiudi",
    en: "Close"
  },
  "general.confirm": {
    it: "Conferma",
    en: "Confirm"
  },
  "general.required": {
    it: "Obbligatorio",
    en: "Required"
  },

  // Theme Sidebar
  "theme.chooseTheme": {
    it: "Scegli il Tema",
    en: "Choose Theme"
  },
  "theme.selectDescription": {
    it: "Seleziona un tema per personalizzare l'aspetto del sito",
    en: "Select a theme to customize the site appearance"
  },
  "theme.active": {
    it: "Attivo",
    en: "Active"
  },
  "theme.welcome": {
    it: "Benvenuto in Legalit",
    en: "Welcome to Legalit"
  },
  "theme.welcomeDescription": {
    it: "Scegli un tema per personalizzare la tua esperienza",
    en: "Choose a theme to personalize your experience"
  },
  "theme.changeAnytime": {
    it: "Puoi cambiare tema in qualsiasi momento dal pannello laterale",
    en: "You can change the theme at any time from the side panel"
  },
  "theme.openSelector": {
    it: "Apri selettore tema",
    en: "Open theme selector"
  },
  "theme.primary": {
    it: "Primario",
    en: "Primary"
  },
  "theme.accent": {
    it: "Accento",
    en: "Accent"
  },
  "theme.background": {
    it: "Sfondo",
    en: "Background"
  },
  "theme.foreground": {
    it: "Testo",
    en: "Text"
  },

  // Theme Names
  "theme.default.name": {
    it: "Legalit Classico",
    en: "Legalit Classic"
  },
  "theme.default.description": {
    it: "Blu istituzionale e azzurro chiaro",
    en: "Institutional blue and light sky blue"
  },
  "theme.colosseo.name": {
    it: "Colosseo",
    en: "Colosseum"
  },
  "theme.colosseo.description": {
    it: "Terracotta antica e blu cielo romano",
    en: "Ancient terracotta and Roman sky blue"
  },
  "theme.villa-este.name": {
    it: "Villa d'Este",
    en: "Villa d'Este"
  },
  "theme.villa-este.description": {
    it: "Verde rigoglioso dei giardini",
    en: "Lush green of the gardens"
  },
  "theme.trevi.name": {
    it: "Fontana di Trevi",
    en: "Trevi Fountain"
  },
  "theme.trevi.description": {
    it: "Turchese dell'acqua e travertino",
    en: "Turquoise water and travertine"
  },
  "theme.borghese.name": {
    it: "Villa Borghese",
    en: "Villa Borghese"
  },
  "theme.borghese.description": {
    it: "Verde smeraldo del lago e marmo",
    en: "Emerald green of the lake and marble"
  },

  // ProfessionalsPreview
  "professionals.ourTeam": {
    it: "Il Nostro Team",
    en: "Our Team"
  },
  "professionals.specializedLawyers": {
    it: "Avvocati specializzati in diverse aree",
    en: "Lawyers specialized in various areas"
  },
  "professionals.teamDescription": {
    it: "Il nostro team di avvocati esperti è impegnato a fornire soluzioni personalizzate per ogni esigenza legale.",
    en: "Our team of expert lawyers is committed to providing personalized solutions for every legal need."
  },
  "professionals.allProfessionals": {
    it: "Tutti i professionisti",
    en: "All professionals"
  },

  // ValuesSection
  "values.quality": {
    it: "Chi Siamo",
    en: "Who We Are"
  },
  "values.qualityDesc": {
    it: "Legalit è una Società tra Avvocati che affianca imprese, enti pubblici e organizzazioni complesse nella difesa dei diritti, nella prevenzione dei rischi e nella creazione di valore.\n\nCrediamo che il diritto non sia soltanto strumento di tutela nel conflitto, ma leva di governo delle decisioni e di protezione delle responsabilità di chi amministra e dirige.",
    en: "Legalit is a Law Firm that supports businesses, public bodies and complex organizations in defending rights, preventing risks and creating value.\n\nWe believe that law is not merely an instrument of protection in conflict, but a lever for governing decisions and protecting the responsibilities of those who manage and lead."
  },
  "values.transparency": {
    it: "Le Nostre Origini",
    en: "Our Origins"
  },
  "values.transparencyDesc": {
    it: "Nato nel 2010 come aggregazione di studi legali indipendenti, radicati nelle proprie realtà territoriali, Legalit ha scelto fin dall'origine un modello professionale fondato su una convinzione precisa: l'eccellenza specialistica deve dialogare con l'integrazione multidisciplinare e il cliente deve poter contare su un rapporto diretto e personale con il partner responsabile.",
    en: "Founded in 2010 as an aggregation of independent law firms rooted in their local territories, Legalit has chosen from the outset a professional model based on a precise conviction: specialist excellence must dialogue with multidisciplinary integration, and the client must be able to count on a direct and personal relationship with the responsible partner."
  },
  "values.experience": {
    it: "Il Nostro Modello",
    en: "Our Model"
  },
  "values.experienceDesc": {
    it: "Un modello radicato nel contesto italiano, costruito per coniugare prossimità, responsabilità e visione strategica, superando tanto la frammentazione specialistica quanto l'impersonalità delle strutture eccessivamente complesse.",
    en: "A model rooted in the Italian context, built to combine proximity, accountability and strategic vision, overcoming both specialist fragmentation and the impersonality of excessively complex structures."
  },
  "values.availability": {
    it: "La Nostra Evoluzione",
    en: "Our Evolution"
  },
  "values.availabilityDesc": {
    it: "Nel gennaio 2026 lo Studio ha aperto una nuova fase del proprio percorso evolutivo costituendosi in Società tra Avvocati, rafforzando la struttura organizzativa e adottando un assetto coerente con l'evoluzione della professione e con la necessità di accompagnare i clienti nelle sfide poste dalla trasformazione tecnologica e dai nuovi modelli di business.",
    en: "In January 2026, the Firm opened a new phase of its evolutionary path by incorporating as a Law Firm, strengthening its organizational structure and adopting a framework consistent with the evolution of the profession and the need to accompany clients through the challenges posed by technological transformation and new business models."
  },
  "values.corporateKit": {
    it: "Il Nostro Impegno",
    en: "Our Commitment"
  },
  "values.corporateKitDesc": {
    it: "Oggi Legalit opera come partner stabile di imprenditori e decisori pubblici, integrando competenze penalistiche, giuslavoristiche, societarie, civilistiche, amministrative e di compliance, al fine di offrire ai clienti soluzioni condivise tra i diversi specialisti, coerenti e tutelanti sotto ogni profilo giuridico.\n\nDifendiamo quando necessario. Preveniamo prima che sia necessario. Accompagniamo le organizzazioni nelle scelte che generano crescita e valore.\n\nStruttura organizzata, visione strategica, approccio multidisciplinare e trasparenza nei rapporti con il cliente rappresentano i tratti distintivi di una comunità di professionisti che punta a costruire con le imprese partnership stabili e durature.",
    en: "Today Legalit operates as a stable partner for entrepreneurs and public decision-makers, integrating criminal, labor, corporate, civil, administrative and compliance expertise, in order to offer clients shared solutions across different specialists, consistent and protective under every legal profile.\n\nWe defend when necessary. We prevent before it becomes necessary. We accompany organizations in the choices that generate growth and value.\n\nOrganized structure, strategic vision, multidisciplinary approach and transparency in client relations are the distinguishing traits of a community of professionals that aims to build stable and lasting partnerships with businesses."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  autoT: (italianText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const autoTranslateCache: Record<string, string> = {};
let pendingTexts: Set<string> = new Set();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let batchListeners: Array<() => void> = [];
let dbCacheLoaded = false;

async function loadDbTranslations() {
  if (dbCacheLoaded) return;
  try {
    const res = await fetch("/api/translations", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      Object.assign(autoTranslateCache, data);
    }
  } catch {}
  dbCacheLoaded = true;
}

function flushPendingTranslations() {
  if (pendingTexts.size === 0) return;
  const textsToTranslate = Array.from(pendingTexts);
  pendingTexts = new Set();

  fetch("/api/auto-translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ texts: textsToTranslate }),
  })
    .then((res) => res.ok ? res.json() : {})
    .then((results: Record<string, string>) => {
      let hasNew = false;
      for (const [key, value] of Object.entries(results)) {
        if (value && value !== autoTranslateCache[key]) {
          autoTranslateCache[key] = value;
          hasNew = true;
        }
      }
      if (hasNew) {
        batchListeners.forEach((fn) => fn());
      }
    })
    .catch(() => {});
}

function queueForTranslation(text: string) {
  if (autoTranslateCache[text] || pendingTexts.has(text)) return;
  pendingTexts.add(text);
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(flushPendingTranslations, 300);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      return (saved as Language) || "it";
    }
    return "it";
  });
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    if (language === "en") {
      loadDbTranslations().then(() => forceUpdate((n) => n + 1));
    }
  }, [language]);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    batchListeners.push(listener);
    return () => {
      batchListeners = batchListeners.filter((fn) => fn !== listener);
    };
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    return key;
  }, [language]);

  const autoT = useCallback((italianText: string): string => {
    if (!italianText || italianText.trim().length === 0) return italianText;
    if (language === "it") return italianText;

    const asKey = translations[italianText];
    if (asKey) return asKey.en;

    const hardcoded = Object.values(translations).find(
      (tr) => tr.it === italianText
    );
    if (hardcoded) return hardcoded.en;

    if (autoTranslateCache[italianText]) {
      return autoTranslateCache[italianText];
    }

    queueForTranslation(italianText);
    return italianText;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t, autoT }), [language, t, autoT]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

const fallbackContext: LanguageContextType = {
  language: "it",
  setLanguage: () => {},
  t: (key: string) => {
    const translation = translations[key];
    return translation ? translation["it"] : key;
  },
  autoT: (italianText: string) => italianText,
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return fallbackContext;
  }
  return context;
}
