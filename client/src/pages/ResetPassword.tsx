import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { legalitLogo } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { Loader2, KeyRound, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const resetSchema = z.object({
    password: z.string()
      .min(12, t("validation.passwordMinLength"))
      .regex(/[A-Z]/, t("validation.passwordUppercase"))
      .regex(/[a-z]/, t("validation.passwordLowercase"))
      .regex(/[0-9]/, t("validation.passwordNumber"))
      .regex(/[^A-Za-z0-9]/, t("validation.passwordSymbol")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordsNoMatch"),
    path: ["confirmPassword"],
  });

  type ResetForm = z.infer<typeof resetSchema>;

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    fetch(`/api/auth/verify-reset/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token non valido");
        return res.json();
      })
      .then((data) => {
        setIsValid(true);
        setEmail(data.email);
      })
      .catch(() => {
        setIsValid(false);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token]);

  const onSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      setResetDone(true);
      toast({
        title: t("resetPassword.successTitle"),
        description: t("resetPassword.successDescription"),
      });
    } catch (error: any) {
      toast({
        title: t("login.errorTitle"),
        description: error.message || t("resetPassword.errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t("resetPassword.invalidTitle")}</CardTitle>
              <CardDescription className="mt-2">
                {t("resetPassword.invalidDescription")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/password-dimenticata">
              <Button variant="outline" className="w-full" data-testid="button-request-new-reset">
                {t("resetPassword.requestNew")}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full" data-testid="button-back-to-login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("forgotPassword.backToLogin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t("resetPassword.doneTitle")}</CardTitle>
              <CardDescription className="mt-2">
                {t("resetPassword.doneDescription")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full" data-testid="button-go-to-login">
                {t("resetPassword.goToLogin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={legalitLogo} alt="Legalit" className="h-12 w-auto" loading="lazy" decoding="async" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("resetPassword.title")}</CardTitle>
            <CardDescription className="mt-2">
              {t("resetPassword.description")} <strong>{email}</strong>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resetPassword.newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        data-testid="input-new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("register.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                {t("resetPassword.requirements")}
              </p>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-reset-submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-2" />
                )}
                {t("resetPassword.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
