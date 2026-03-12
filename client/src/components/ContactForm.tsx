import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const contactSchema = z.object({
    name: z.string().min(2, t("validation.nameMin")),
    email: z.string().email(t("validation.emailInvalid")),
    phone: z.string().optional(),
    subject: z.string().min(1, t("validation.subjectRequired")),
    message: z.string().min(10, t("validation.messageMin")),
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("contactForm.toastTitle"),
        description: t("contactForm.toastDescription"),
      });
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'invio del messaggio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await contactMutation.mutateAsync(data);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">{t("contactForm.successTitle")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("contactForm.successMessage")}
          </p>
          <Button onClick={() => { setIsSubmitted(false); form.reset(); }} className="rounded-full">
            {t("contactForm.sendAnother")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">{t("contactForm.title")}</CardTitle>
        <p className="text-muted-foreground">
          {t("contactForm.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contactForm.name")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("contactForm.namePlaceholder")} className="rounded-lg" {...field} data-testid="input-contact-name" />
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
                    <FormLabel>{t("contactForm.email")} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("contactForm.emailPlaceholder")} className="rounded-lg" {...field} data-testid="input-contact-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contactForm.phone")}</FormLabel>
                    <FormControl>
                      <Input placeholder="+39 123 456 7890" className="rounded-lg" {...field} data-testid="input-contact-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contactForm.subject")} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg" data-testid="select-contact-subject">
                          <SelectValue placeholder={t("contactForm.subjectPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consulenza">{t("contactForm.subjectConsultation")}</SelectItem>
                        <SelectItem value="informazioni">{t("contactForm.subjectInfo")}</SelectItem>
                        <SelectItem value="informazioni-amministrative">{t("contactForm.subjectAdministrative")}</SelectItem>
                        <SelectItem value="collaborazione">{t("contactForm.subjectCollaboration")}</SelectItem>
                        <SelectItem value="altro">{t("contactForm.subjectOther")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contactForm.message")} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("contactForm.messagePlaceholder")}
                      className="min-h-[300px] resize-none rounded-lg"
                      {...field}
                      data-testid="textarea-contact-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full" size="lg" data-testid="button-contact-submit">
              {isSubmitting ? (
                t("contactForm.submitting")
              ) : (
                <>
                  {t("contactForm.submit")}
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
