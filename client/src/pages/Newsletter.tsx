import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Mail, CheckCircle, Scale, BookOpen, Newspaper, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ApexLogoAnimation } from "@/components/ApexLogoAnimation";
import heroImage from "@assets/optimized/stock_images/professional_busines_64b8d01d.webp";
import { useTheme } from "@/contexts/ThemeContext";

const themeOverlays: Record<string, { gradient: string; buttonBg: string; buttonText: string }> = {
  default: {
    gradient: 'linear-gradient(to bottom, rgba(46, 104, 132, 0.9) 0%, rgba(46, 104, 132, 0.8) 50%, rgba(46, 104, 132, 0.95) 100%)',
    buttonBg: 'bg-white text-[#2e6884]',
    buttonText: '#2e6884',
  },
  colosseo: {
    gradient: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.9) 0%, rgba(139, 69, 19, 0.8) 50%, rgba(139, 69, 19, 0.95) 100%)',
    buttonBg: 'bg-white text-[#8B4513]',
    buttonText: '#8B4513',
  },
  'villa-este': {
    gradient: 'linear-gradient(to bottom, rgba(34, 85, 51, 0.9) 0%, rgba(34, 85, 51, 0.8) 50%, rgba(34, 85, 51, 0.95) 100%)',
    buttonBg: 'bg-white text-[#225533]',
    buttonText: '#225533',
  },
  trevi: {
    gradient: 'linear-gradient(to bottom, rgba(0, 100, 100, 0.9) 0%, rgba(0, 100, 100, 0.8) 50%, rgba(0, 100, 100, 0.95) 100%)',
    buttonBg: 'bg-white text-[#006464]',
    buttonText: '#006464',
  },
  borghese: {
    gradient: 'linear-gradient(to bottom, rgba(25, 80, 60, 0.9) 0%, rgba(25, 80, 60, 0.8) 50%, rgba(25, 80, 60, 0.95) 100%)',
    buttonBg: 'bg-white text-[#19503C]',
    buttonText: '#19503C',
  },
};
import featureImage1 from "@assets/optimized/stock_images/professional_busines_72e1467a.webp";
import featureImage2 from "@assets/optimized/stock_images/professional_busines_0be1fa04.webp";
import benefitImage1 from "@assets/optimized/stock_images/legal_documents_law__a5b06305.webp";
import benefitImage2 from "@assets/optimized/stock_images/business_analysis_re_4cd30d94.webp";
import benefitImage3 from "@assets/optimized/stock_images/business_team_meetin_57d868c4.webp";
import benefitImage4 from "@assets/optimized/stock_images/professional_network_b21abf49.webp";

const subscribeSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  privacy: z.boolean().refine((val) => val === true, {
    message: "Devi accettare l'informativa sulla privacy",
  }),
});

type SubscribeForm = z.infer<typeof subscribeSchema>;

export default function Newsletter() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const overlay = themeOverlays[currentTheme.id] || themeOverlays.default;

  const form = useForm<SubscribeForm>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
      privacy: false,
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: language === "it" ? "Iscrizione completata!" : "Subscription complete!",
        description: language === "it" 
          ? "Riceverai presto le nostre ultime novità" 
          : "You will soon receive our latest news",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === "it" ? "Errore" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscribeForm) => {
    subscribeMutation.mutate({ email: data.email });
  };

  const benefits = [
    {
      icon: Scale,
      image: benefitImage1,
      title: language === "it" ? "Aggiornamenti Legali" : "Legal Updates",
      description: language === "it" 
        ? "Ricevi le ultime novità su leggi, normative e sentenze rilevanti"
        : "Receive the latest updates on laws, regulations, and relevant rulings",
    },
    {
      icon: BookOpen,
      image: benefitImage2,
      title: language === "it" ? "Approfondimenti" : "In-depth Analysis",
      description: language === "it"
        ? "Articoli esclusivi redatti dai nostri professionisti esperti"
        : "Exclusive articles written by our expert professionals",
    },
    {
      icon: Newspaper,
      image: benefitImage3,
      title: language === "it" ? "News dello Studio" : "Firm News",
      description: language === "it"
        ? "Eventi, convegni e novità dalla vita professionale di Legalit"
        : "Events, conferences, and news from Legalit's professional life",
    },
    {
      icon: Users,
      image: benefitImage4,
      title: language === "it" ? "Community" : "Community",
      description: language === "it"
        ? "Entra a far parte della nostra rete di professionisti e clienti"
        : "Join our network of professionals and clients",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Newsletter"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: '#2e6884e6' }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8"
            >
              <Mail className="h-10 w-10 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
              {language === "it" ? "Resta Aggiornato" : "Stay Updated"}
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              {language === "it"
                ? "Iscriviti alla nostra newsletter per ricevere aggiornamenti legali, approfondimenti e novità dallo studio direttamente nella tua casella di posta."
                : "Subscribe to our newsletter to receive legal updates, insights, and firm news directly in your inbox."}
            </p>

            {!isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder={language === "it" ? "La tua email" : "Your email"}
                                  className="bg-white/90 border-0 h-12 text-foreground placeholder:text-muted-foreground"
                                  data-testid="input-newsletter-email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="privacy"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-white/60 data-[state=checked]:bg-white data-[state=checked]:border-white"
                                  style={{ '--checkbox-text': overlay.buttonText } as React.CSSProperties}
                                  data-testid="checkbox-newsletter-privacy"
                                />
                              </FormControl>
                              <FormLabel className="text-sm text-white/80 font-normal leading-tight cursor-pointer">
                                {language === "it"
                                  ? "Accetto l'informativa sulla privacy e acconsento al trattamento dei miei dati"
                                  : "I accept the privacy policy and consent to the processing of my data"}
                              </FormLabel>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-12 bg-white hover:bg-white/90 font-medium"
                          style={{ color: overlay.buttonText }}
                          disabled={subscribeMutation.isPending}
                          data-testid="button-newsletter-subscribe"
                        >
                          {subscribeMutation.isPending
                            ? (language === "it" ? "Iscrizione in corso..." : "Subscribing...")
                            : (language === "it" ? "Iscriviti Ora" : "Subscribe Now")}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md mx-auto"
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-medium text-white mb-2">
                  {language === "it" ? "Grazie per l'iscrizione!" : "Thank you for subscribing!"}
                </h3>
                <p className="text-white/80">
                  {language === "it"
                    ? "Controlla la tua casella email per confermare l'iscrizione."
                    : "Check your inbox to confirm your subscription."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              {language === "it" ? "Cosa Riceverai" : "What You'll Receive"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "it"
                ? "Contenuti di valore pensati per professionisti e aziende che vogliono restare al passo con il mondo legale."
                : "Valuable content designed for professionals and businesses who want to stay up to date with the legal world."}
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
              <ApexLogoAnimation size={1250} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full relative z-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate transition-all duration-300 overflow-hidden">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-20 h-20 rounded-full bg-background shadow-lg">
                      <benefit.icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardContent className="p-10 text-center">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-light text-foreground">
                {language === "it" 
                  ? "Approfondimenti dal Mondo Legale" 
                  : "Insights from the Legal World"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {language === "it"
                  ? "I nostri avvocati condividono regolarmente analisi e commenti sulle novità normative più rilevanti per imprese e professionisti."
                  : "Our lawyers regularly share analyses and comments on the most relevant regulatory developments for businesses and professionals."}
              </p>
              <ul className="space-y-3">
                {[
                  language === "it" ? "Diritto del lavoro e relazioni sindacali" : "Labor law and union relations",
                  language === "it" ? "Diritto societario e M&A" : "Corporate law and M&A",
                  language === "it" ? "Compliance e privacy" : "Compliance and privacy",
                  language === "it" ? "Reati d'impresa" : "Corporate crime",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={featureImage1}
                  alt="Legal insights"
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src={featureImage2}
                  alt="Professional team"
                  className="rounded-lg shadow-lg w-full h-48 object-cover mt-8"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>
          </div>

          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center mt-16"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                data-testid="button-newsletter-scroll-top"
              >
                {language === "it" ? "Iscriviti Ora" : "Subscribe Now"}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
