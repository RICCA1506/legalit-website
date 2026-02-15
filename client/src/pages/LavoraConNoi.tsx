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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { 
  Briefcase, 
  MapPin, 
  Send, 
  CheckCircle, 
  FileText, 
  Upload,
  Users,
  ArrowRight,
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
  description: string;
  descriptionEN: string;
}

const jobPositions: JobPosition[] = [
  {
    id: "1",
    title: "Avvocato junior specializzato in Diritto Amministrativo",
    titleEN: "Junior Lawyer specialized in Administrative Law",
    location: "Palermo",
    description: "Ricerchiamo un avvocato junior con specializzazione in diritto amministrativo per la nostra sede di Palermo. Il candidato ideale ha maturato esperienza in ambito di appalti pubblici, contenziosi amministrativi e rapporti con la Pubblica Amministrazione.",
    descriptionEN: "We are looking for a junior lawyer specialized in administrative law for our Palermo office. The ideal candidate has experience in public procurement, administrative litigation, and relations with Public Administration.",
  },
  {
    id: "2",
    title: "Avvocato junior specializzato in Diritto del Lavoro",
    titleEN: "Junior Lawyer specialized in Labor Law",
    location: "Roma",
    description: "Per il nostro team di Roma, siamo alla ricerca di un avvocato junior con specializzazione in diritto del lavoro. Il candidato seguirà contenziosi giuslavoristici, consulenza in materia di contratti di lavoro e relazioni industriali.",
    descriptionEN: "For our Rome team, we are looking for a junior lawyer specialized in labor law. The candidate will handle employment litigation, consulting on employment contracts and industrial relations.",
  },
  {
    id: "3",
    title: "Praticante / neo laureato",
    titleEN: "Trainee / Recent Graduate",
    location: "Roma",
    description: "Offriamo opportunità di praticantato presso la nostra sede principale di Roma. Il candidato avrà l'opportunità di affiancare professionisti esperti in diverse aree del diritto, acquisendo competenze trasversali e specialistiche.",
    descriptionEN: "We offer traineeship opportunities at our main Rome office. The candidate will have the opportunity to work alongside experienced professionals in various areas of law, acquiring cross-cutting and specialized skills.",
  }
];

const applicationSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  message: z.string().min(10, "Messaggio troppo breve"),
  position: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function LavoraConNoi() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
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

  const handleApply = (position: JobPosition) => {
    setSelectedPosition(position);
    form.setValue("position", position.title);
    setIsModalOpen(true);
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

              <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobPositions.map((position) => (
                  <motion.div key={position.id} variants={staggerItemVariants(40, 0.5)}>
                    <Card className="h-full hover-elevate transition-all duration-300 border-primary/20 hover:border-primary/40">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge variant="secondary" className="rounded-full">
                            <MapPin className="h-3 w-3 mr-1" />
                            {position.location}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">
                          {language === "it" ? position.title : position.titleEN}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {language === "it" ? position.description : position.descriptionEN}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full rounded-full"
                          onClick={() => handleApply(position)}
                          data-testid={`button-apply-${position.id}`}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {language === "it" ? "Candidati" : "Apply"}
                        </Button>
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
                            <Upload className="h-5 w-5 text-muted-foreground" />
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

      {/* Application Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                          ? "Raccontaci chi sei e perché sei interessato a questa posizione..." 
                          : "Tell us about yourself and why you are interested in this position..."}
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
                <Upload className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {language === "it" 
                    ? "Per allegare CV e documenti, invia a: recruitment@legalit.it"
                    : "To attach CV and documents, send to: recruitment@legalit.it"}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  {language === "it" ? "Annulla" : "Cancel"}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-full"
                  disabled={applicationMutation.isPending}
                  data-testid="button-submit-apply"
                >
                  {applicationMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === "it" ? "Invia" : "Send"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="relative z-10">
        <CtaSection />
      </div>
    </div>
  );
}
