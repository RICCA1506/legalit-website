import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import CtaSection from "@/components/CtaSection";
import AnimatedElement from "@/components/AnimatedElement";
import LandoReveal from "@/components/LandoReveal";
import StaggerContainer, { staggerItemVariants } from "@/components/StaggerContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { legalitLogo } from "@/lib/data";
import legalitSymbol from "@assets/000_LOGO_LEGALIT_STA.JPG_(3)_(1)_1772964106733.png";
import {
  Briefcase,
  MapPin,
  Send,
  CheckCircle,
  FileText,
  Upload,
  Clock,
  ChevronRight,
  Users,
  GraduationCap,
  Building2,
} from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import LinkedInHeroCard from "@/components/LinkedInHeroCard";
import { useLinkedInSentinel } from "@/hooks/useLinkedInSentinel";
import { apiRequest } from "@/lib/queryClient";

interface JobPosition {
  id: string;
  title: string;
  titleEN: string;
  location: string;
  type: string;
  typeEN: string;
  postedDaysAgo: number;
  description: string;
  descriptionEN: string;
  fullDescription: string;
  fullDescriptionEN: string;
  requirements: string[];
  requirementsEN: string[];
  offer: string[];
  offerEN: string[];
}

const jobPositions: JobPosition[] = [
  {
    id: "1",
    title: "Avvocato junior specializzato in Diritto Amministrativo",
    titleEN: "Junior Lawyer specialized in Administrative Law",
    location: "Palermo",
    type: "Tempo indeterminato",
    typeEN: "Full-time",
    postedDaysAgo: 3,
    description: "Ricerchiamo un avvocato junior con specializzazione in diritto amministrativo per la nostra sede di Palermo. Il candidato ideale ha maturato esperienza in ambito di appalti pubblici, contenziosi amministrativi e rapporti con la Pubblica Amministrazione.",
    descriptionEN: "We are looking for a junior lawyer specialized in administrative law for our Palermo office. The ideal candidate has experience in public procurement, administrative litigation, and relations with Public Administration.",
    fullDescription: "Ricerchiamo un avvocato junior con specializzazione in diritto amministrativo per la nostra sede di Palermo. Il candidato ideale ha maturato esperienza in ambito di appalti pubblici, contenziosi amministrativi e rapporti con la Pubblica Amministrazione.\n\nLa risorsa sarà inserita nel team di diritto amministrativo e affiancherà i professionisti senior nella gestione di pratiche complesse, partecipando attivamente alle attività di studio e di consulenza.",
    fullDescriptionEN: "We are looking for a junior lawyer specialized in administrative law for our Palermo office. The ideal candidate has experience in public procurement, administrative litigation, and relations with Public Administration.\n\nThe resource will join the administrative law team and will work alongside senior professionals in managing complex cases, actively participating in research and consulting activities.",
    requirements: [
      "Abilitazione all'esercizio della professione forense",
      "Specializzazione o esperienza documentata in diritto amministrativo",
      "Conoscenza della disciplina degli appalti pubblici (D.Lgs. 36/2023)",
      "Esperienza in contenziosi TAR e Consiglio di Stato",
      "Buona conoscenza della lingua inglese",
      "Capacità di lavoro in team e orientamento al risultato",
    ],
    requirementsEN: [
      "Bar admission",
      "Specialization or documented experience in administrative law",
      "Knowledge of public procurement regulations (D.Lgs. 36/2023)",
      "Experience in TAR and Council of State proceedings",
      "Good knowledge of the English language",
      "Teamwork skills and result orientation",
    ],
    offer: [
      "Inserimento in un contesto professionale strutturato e dinamico",
      "Affiancamento a professionisti di alto profilo",
      "Percorso di crescita professionale personalizzato",
      "Formazione continua e aggiornamento normativo",
      "Retribuzione commisurata all'esperienza",
    ],
    offerEN: [
      "Integration in a structured and dynamic professional environment",
      "Mentorship from high-profile professionals",
      "Personalized professional growth path",
      "Continuous training and regulatory updates",
      "Compensation commensurate with experience",
    ],
  },
  {
    id: "2",
    title: "Avvocato junior specializzato in Diritto del Lavoro",
    titleEN: "Junior Lawyer specialized in Labor Law",
    location: "Roma",
    type: "Tempo indeterminato",
    typeEN: "Full-time",
    postedDaysAgo: 5,
    description: "Per il nostro team di Roma, siamo alla ricerca di un avvocato junior con specializzazione in diritto del lavoro. Il candidato seguirà contenziosi giuslavoristici, consulenza in materia di contratti di lavoro e relazioni industriali.",
    descriptionEN: "For our Rome team, we are looking for a junior lawyer specialized in labor law. The candidate will handle employment litigation, consulting on employment contracts and industrial relations.",
    fullDescription: "Per il nostro team di Roma, siamo alla ricerca di un avvocato junior con specializzazione in diritto del lavoro. Il candidato seguirà contenziosi giuslavoristici, consulenza in materia di contratti di lavoro e relazioni industriali.\n\nLo Studio Legalit è particolarmente attivo nel settore del diritto del lavoro, assistendo imprese private, enti pubblici, associazioni di categoria e singoli lavoratori. La risorsa sarà coinvolta in attività di consulenza stragiudiziale e giudiziale, partecipando a udienze e supportando i partner nelle negoziazioni collettive.",
    fullDescriptionEN: "For our Rome team, we are looking for a junior lawyer specialized in labor law. The candidate will handle employment litigation, consulting on employment contracts and industrial relations.\n\nLegalit is particularly active in the labor law sector, assisting private companies, public entities, trade associations and individual workers. The resource will be involved in out-of-court and judicial consulting activities, participating in hearings and supporting partners in collective negotiations.",
    requirements: [
      "Abilitazione all'esercizio della professione forense",
      "Specializzazione o esperienza in diritto del lavoro (pubblico e privato)",
      "Conoscenza di diritto sindacale e relazioni industriali",
      "Capacità di gestione autonoma del contenzioso",
      "Iscrizione all'AGI o analoga associazione di categoria è un plus",
      "Buona padronanza della lingua inglese",
    ],
    requirementsEN: [
      "Bar admission",
      "Specialization or experience in labor law (public and private)",
      "Knowledge of labor relations and industrial relations",
      "Ability to independently manage litigation",
      "AGI membership or similar association is a plus",
      "Good command of English",
    ],
    offer: [
      "Collaborazione in un team di diritto del lavoro consolidato e riconosciuto",
      "Partecipazione a trattative sindacali e negoziazione di CCNL",
      "Accesso a clientela di rilievo (enti pubblici, grandi imprese)",
      "Formazione specialistica continua",
      "Ambiente di lavoro stimolante e meritocratico",
    ],
    offerEN: [
      "Collaboration in a well-established and recognized labor law team",
      "Participation in union negotiations and CCNL bargaining",
      "Access to prominent clients (public entities, large companies)",
      "Continuous specialized training",
      "Stimulating and merit-based work environment",
    ],
  },
  {
    id: "3",
    title: "Praticante / neo laureato",
    titleEN: "Trainee / Recent Graduate",
    location: "Roma",
    type: "Praticantato",
    typeEN: "Traineeship",
    postedDaysAgo: 7,
    description: "Offriamo opportunità di praticantato presso la nostra sede principale di Roma. Il candidato avrà l'opportunità di affiancare professionisti esperti in diverse aree del diritto, acquisendo competenze trasversali e specialistiche.",
    descriptionEN: "We offer traineeship opportunities at our main Rome office. The candidate will have the opportunity to work alongside experienced professionals in various areas of law, acquiring cross-cutting and specialized skills.",
    fullDescription: "Offriamo opportunità di praticantato presso la nostra sede principale di Roma. Il candidato avrà l'opportunità di affiancare professionisti esperti in diverse aree del diritto, acquisendo competenze trasversali e specialistiche.\n\nLo Studio Legalit – Società tra Avvocati S.r.l. offre un ambiente di praticantato strutturato, con un percorso formativo personalizzato e un affiancamento diretto ai soci dello studio. Il praticante sarà coinvolto in attività di ricerca giuridica, redazione di atti e partecipazione alle udienze.",
    fullDescriptionEN: "We offer traineeship opportunities at our main Rome office. The candidate will have the opportunity to work alongside experienced professionals in various areas of law, acquiring cross-cutting and specialized skills.\n\nLegalit – Società tra Avvocati S.r.l. offers a structured traineeship environment, with a personalized training path and direct mentorship from the firm's partners. The trainee will be involved in legal research, drafting documents and attending hearings.",
    requirements: [
      "Laurea in Giurisprudenza (voto minimo 100/110)",
      "Forte motivazione per la professione forense",
      "Interesse per il diritto penale, del lavoro o amministrativo",
      "Ottime capacità di analisi e di sintesi",
      "Buona conoscenza della lingua inglese",
      "Disponibilità a tempo pieno",
    ],
    requirementsEN: [
      "Law degree (minimum grade 100/110)",
      "Strong motivation for the legal profession",
      "Interest in criminal, labor or administrative law",
      "Excellent analytical and synthesis skills",
      "Good knowledge of the English language",
      "Full-time availability",
    ],
    offer: [
      "Praticantato in uno studio strutturato e multidisciplinare",
      "Affiancamento diretto a soci e partner dello Studio",
      "Coinvolgimento in procedimenti penali, giuslavoristici e amministrativi",
      "Supporto alla preparazione per l'esame di abilitazione",
      "Possibilità di inserimento al termine del praticantato",
    ],
    offerEN: [
      "Traineeship in a structured and multidisciplinary firm",
      "Direct mentorship from firm partners",
      "Involvement in criminal, labor and administrative proceedings",
      "Support in preparing for the bar exam",
      "Possibility of employment at the end of the traineeship",
    ],
  },
];

const applicationSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  message: z.string().min(10, "Messaggio troppo breve"),
  position: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

function formatPostedDate(daysAgo: number, language: string): string {
  if (language === "it") {
    if (daysAgo === 0) return "Oggi";
    if (daysAgo === 1) return "Ieri";
    if (daysAgo < 7) return `${daysAgo} giorni fa`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} settiman${Math.floor(daysAgo / 7) === 1 ? "a" : "e"} fa`;
    return `${Math.floor(daysAgo / 30)} mes${Math.floor(daysAgo / 30) === 1 ? "e" : "i"} fa`;
  } else {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) === 1 ? "" : "s"} ago`;
    return `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) === 1 ? "" : "s"} ago`;
  }
}

export default function LavoraConNoi() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("positions");
  const linkedInSentinelRef = useLinkedInSentinel();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      position: "",
    },
  });

  const spontaneousForm = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      position: "autocandidatura",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const response = await apiRequest("POST", "/api/job-applications", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setIsApplyModalOpen(false);
      toast({
        title: language === "it" ? "Candidatura inviata!" : "Application sent!",
        description: language === "it"
          ? "Ti contatteremo al più presto."
          : "We will contact you as soon as possible.",
      });
      form.reset();
      spontaneousForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: language === "it" ? "Errore" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenDetail = (position: JobPosition) => {
    setSelectedPosition(position);
    setIsDetailModalOpen(true);
  };

  const handleApply = (position: JobPosition) => {
    setSelectedPosition(position);
    form.setValue("position", position.title);
    setIsDetailModalOpen(false);
    setIsApplyModalOpen(true);
  };

  const handleApplyFromDetail = () => {
    if (selectedPosition) {
      form.setValue("position", selectedPosition.title);
      setIsDetailModalOpen(false);
      setIsApplyModalOpen(true);
    }
  };

  const onSubmitApplication = (data: ApplicationForm) => {
    applicationMutation.mutate(data);
  };

  const onSubmitSpontaneous = (data: ApplicationForm) => {
    applicationMutation.mutate({
      ...data,
      position: "Autocandidatura spontanea",
    });
  };

  return (
    <div className="relative">
      <div className="relative z-0 pt-28 pb-8 text-white overflow-hidden min-h-[30vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentTheme.heroImage})` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: '#2e6884e6' }}
        />
        <div className="w-full px-5 md:px-12 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
            <div className="flex-1">
              <AnimatedElement once={true}>
                <span className="text-xs md:text-sm uppercase tracking-[0.2em] mb-2 block text-white/60">
                  Legalit
                </span>
              </AnimatedElement>
              <AnimatedElement delay={100} once={true}>
                <LandoReveal
                  text={language === "it" ? "Lavora con noi" : "Work with us"}
                  as="h1"
                  className="text-2xl md:text-4xl mb-2 md:mb-3 text-brutalist text-white"
                  delay={100}
                />
              </AnimatedElement>
              <AnimatedElement delay={200} once={true}>
                <p className="text-white/80 mb-3 md:mb-4 text-left max-w-[500px] text-[15px] md:text-lg">
                  {language === "it"
                    ? "Unisciti al nostro team di professionisti"
                    : "Join our team of professionals"}
                </p>
              </AnimatedElement>
              <AnimatedElement delay={300} once={true}>
                <a
                  href="https://www.linkedin.com/company/legalit-societ%C3%A0-tra-avvocati/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#ffffff4d] backdrop-blur-sm border border-white/30 rounded-full px-5 py-2.5 hover:bg-[#ffffff66] transition-colors"
                  data-testid="link-linkedin-lavora"
                >
                  <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{language === "it" ? "Seguici su LinkedIn" : "Follow us on LinkedIn"}</p>
                    <p className="text-white/70 text-xs">{language === "it" ? "Scopri le opportunità e la vita in studio" : "Discover opportunities and life at the firm"}</p>
                  </div>
                </a>
              </AnimatedElement>
            </div>

            <div className="lg:flex-1">
              <LinkedInHeroCard />
            </div>
          </div>
        </div>
      </div>

      <div ref={linkedInSentinelRef} className="relative z-10 h-px" aria-hidden="true" />
      <section className="py-6 md:py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-5 md:px-12 relative z-10">
          <AnimatedElement className="text-center mb-6">
            <LandoReveal
              text={activeTab === "positions"
                ? (language === "it" ? "Posizioni aperte" : "Open positions")
                : (language === "it" ? "Autocandidatura" : "Spontaneous Application")}
              as="h2"
              className="text-2xl md:text-3xl lg:text-4xl text-foreground mb-2 text-brutalist"
              delay={100}
            />
            <p className="text-muted-foreground text-[15px] md:text-lg max-w-2xl mx-auto">
              {activeTab === "positions"
                ? (language === "it"
                  ? "Scopri le opportunità di carriera disponibili presso Legalit."
                  : "Discover the career opportunities available at Legalit.")
                : (language === "it"
                  ? "Non trovi la posizione giusta? Inviaci la tua candidatura spontanea."
                  : "Can't find the right position? Send us your spontaneous application.")}
            </p>
          </AnimatedElement>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="positions" className="flex items-center gap-2" data-testid="tab-positions">
                <Briefcase className="h-4 w-4" />
                {language === "it" ? "Posizioni aperte" : "Open positions"}
              </TabsTrigger>
              <TabsTrigger value="spontaneous" className="flex items-center gap-2" data-testid="tab-spontaneous">
                <FileText className="h-4 w-4" />
                {language === "it" ? "Autocandidatura" : "Spontaneous application"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions">
              <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobPositions.map((position) => (
                  <motion.div key={position.id} variants={staggerItemVariants(40, 0.5)}>
                    <Card
                      className="h-full flex flex-col hover-elevate transition-all duration-300 cursor-pointer"
                      onClick={() => handleOpenDetail(position)}
                      data-testid={`card-job-${position.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="mb-3">
                          <h3 className="font-semibold text-[15px] leading-snug text-foreground line-clamp-2 mb-1">
                            {language === "it" ? position.title : position.titleEN}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <img
                              src={legalitSymbol}
                              alt="Legalit"
                              className="w-4 h-4 object-contain shrink-0"
                            />
                            Legalit – Società tra Avvocati
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {position.location}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            {language === "it" ? position.type : position.typeEN}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {language === "it" ? position.description : position.descriptionEN}
                        </p>

                        <button
                          className="text-sm text-primary hover:underline text-left mt-1 w-fit"
                          onClick={(e) => { e.stopPropagation(); handleOpenDetail(position); }}
                          data-testid={`link-detail-${position.id}`}
                        >
                          {language === "it" ? "Mostra di più" : "Show more"}
                          <ChevronRight className="inline h-3 w-3 ml-0.5" />
                        </button>
                      </CardHeader>

                      <CardContent className="pt-0 mt-auto">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatPostedDate(position.postedDaysAgo, language)}
                          </span>
                          <Button
                            size="sm"
                            className="rounded-full gap-1.5"
                            onClick={(e) => { e.stopPropagation(); handleApply(position); }}
                            data-testid={`button-apply-${position.id}`}
                          >
                            <Send className="h-3.5 w-3.5" />
                            {language === "it" ? "Candidati" : "Apply"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="spontaneous">
              <AnimatedElement className="max-w-2xl mx-auto">
                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {language === "it" ? "Candidatura inviata!" : "Application sent!"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {language === "it"
                        ? "Grazie per il tuo interesse. Ti contatteremo al più presto."
                        : "Thank you for your interest. We will contact you as soon as possible."}
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline" className="rounded-full">
                      {language === "it" ? "Invia un'altra candidatura" : "Submit another application"}
                    </Button>
                  </motion.div>
                ) : (
                  <Card className="border-primary/20">
                    <CardContent className="p-6 md:p-8">
                      <Form {...spontaneousForm}>
                        <form onSubmit={spontaneousForm.handleSubmit(onSubmitSpontaneous)} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                              control={spontaneousForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{language === "it" ? "Nome e Cognome" : "Full Name"} *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={language === "it" ? "Mario Rossi" : "John Doe"}
                                      className="rounded-lg"
                                      {...field}
                                      data-testid="input-spontaneous-name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={spontaneousForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder="email@example.com"
                                      className="rounded-lg"
                                      {...field}
                                      data-testid="input-spontaneous-email"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={spontaneousForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "it" ? "Telefono" : "Phone"}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+39 123 456 7890"
                                    className="rounded-lg"
                                    {...field}
                                    data-testid="input-spontaneous-phone"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={spontaneousForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === "it" ? "Presentati" : "Introduce yourself"} *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={language === "it"
                                      ? "Raccontaci chi sei, le tue esperienze e perché vorresti lavorare con noi..."
                                      : "Tell us about yourself, your experience and why you would like to work with us..."}
                                    className="rounded-lg min-h-[150px]"
                                    {...field}
                                    data-testid="input-spontaneous-message"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {language === "it"
                                ? "Per allegare il CV, invia la tua candidatura a: recruitment@legalit.it"
                                : "To attach your CV, send your application to: recruitment@legalit.it"}
                            </p>
                          </div>

                          <Button
                            type="submit"
                            className="w-full rounded-full"
                            disabled={applicationMutation.isPending}
                            data-testid="button-submit-spontaneous"
                          >
                            {applicationMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                                {language === "it" ? "Invio in corso..." : "Sending..."}
                              </span>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                {language === "it" ? "Invia candidatura" : "Send application"}
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </AnimatedElement>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <CtaSection />

      {/* Job Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPosition && (
            <>
              <DialogHeader className="pb-2">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg leading-snug text-left">
                    {language === "it" ? selectedPosition.title : selectedPosition.titleEN}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <img
                      src={legalitSymbol}
                      alt="Legalit"
                      className="w-4 h-4 object-contain shrink-0"
                    />
                    Legalit – Società tra Avvocati S.r.l.
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {selectedPosition.location}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {language === "it" ? selectedPosition.type : selectedPosition.typeEN}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatPostedDate(selectedPosition.postedDaysAgo, language)}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    {language === "it" ? "Descrizione del ruolo" : "Role description"}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                    {(language === "it" ? selectedPosition.fullDescription : selectedPosition.fullDescriptionEN)
                      .split("\n\n")
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    {language === "it" ? "Requisiti" : "Requirements"}
                  </h4>
                  <ul className="space-y-1.5">
                    {(language === "it" ? selectedPosition.requirements : selectedPosition.requirementsEN).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    {language === "it" ? "Cosa offriamo" : "What we offer"}
                  </h4>
                  <ul className="space-y-1.5">
                    {(language === "it" ? selectedPosition.offer : selectedPosition.offerEN).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-2 border-t border-border">
                  <Button
                    className="flex-1 rounded-full gap-2"
                    onClick={handleApplyFromDetail}
                    data-testid={`button-apply-detail-${selectedPosition.id}`}
                  >
                    <Send className="h-4 w-4" />
                    {language === "it" ? "Candidati ora" : "Apply now"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setIsDetailModalOpen(false)}
                    data-testid="button-close-detail"
                  >
                    {language === "it" ? "Chiudi" : "Close"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Form Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {language === "it" ? "Candidati per questa posizione" : "Apply for this position"}
            </DialogTitle>
            {selectedPosition && (
              <p className="text-sm text-muted-foreground mt-1">
                {language === "it" ? selectedPosition.title : selectedPosition.titleEN}
              </p>
            )}
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitApplication)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "it" ? "Nome e Cognome" : "Full Name"} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === "it" ? "Mario Rossi" : "John Doe"}
                        className="rounded-lg"
                        {...field}
                        data-testid="input-apply-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        className="rounded-lg"
                        {...field}
                        data-testid="input-apply-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "it" ? "Telefono" : "Phone"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+39 123 456 7890"
                        className="rounded-lg"
                        {...field}
                        data-testid="input-apply-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "it" ? "Lettera di presentazione" : "Cover letter"} *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === "it"
                          ? "Raccontaci perché sei il candidato ideale per questa posizione..."
                          : "Tell us why you are the ideal candidate for this position..."}
                        className="rounded-lg min-h-[120px]"
                        {...field}
                        data-testid="input-apply-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {language === "it"
                    ? "Per allegare il CV invia a: recruitment@legalit.it"
                    : "To attach your CV send to: recruitment@legalit.it"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 rounded-full"
                  disabled={applicationMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applicationMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {language === "it" ? "Invio in corso..." : "Sending..."}
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === "it" ? "Invia candidatura" : "Send application"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  {language === "it" ? "Annulla" : "Cancel"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
