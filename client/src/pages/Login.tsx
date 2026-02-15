import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { legalitLogo } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { LogIn, Loader2, Shield, ArrowLeft } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, login, isLoggingIn } = useAuth();
  const [requires2FA, setRequires2FA] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordMin")),
    twoFactorCode: z.string().optional(),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/area-riservata");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        email: savedCredentials?.email || data.email,
        password: savedCredentials?.password || data.password,
        twoFactorCode: data.twoFactorCode,
      });
      
      if (result?.requires2FA) {
        setRequires2FA(true);
        setSavedCredentials({ email: data.email, password: data.password });
        toast({
          title: "Verifica in due passaggi",
          description: "Inserisci il codice dalla tua app di autenticazione",
        });
        return;
      }
      
      toast({
        title: t("login.successTitle"),
        description: t("login.successDescription"),
      });
      navigate("/area-riservata");
    } catch (error: any) {
      toast({
        title: t("login.errorTitle"),
        description: error.message || t("login.errorDescription"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={legalitLogo} alt="Legalit" className="h-12 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription className="mt-2">
              {t("login.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!requires2FA ? (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nome@legalit.it"
                            autoComplete="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login.password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-right">
                    <Link href="/password-dimenticata">
                      <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-forgot-password">
                        {t("login.forgotPassword")}
                      </span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-md">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-sm">Inserisci il codice a 6 cifre dalla tua app di autenticazione</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="twoFactorCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice di verifica</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono"
                            data-testid="input-2fa-code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setRequires2FA(false);
                      setSavedCredentials(null);
                      form.reset();
                    }}
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Torna al login
                  </Button>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
                data-testid="button-login-submit"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : requires2FA ? (
                  <Shield className="h-4 w-4 mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {requires2FA ? "Verifica" : t("login.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
