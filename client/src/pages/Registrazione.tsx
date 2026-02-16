import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { legalitLogo } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function Registrazione() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, register, isRegistering } = useAuth();

  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [verifyingToken, setVerifyingToken] = useState(true);

  const params = new URLSearchParams(searchString);
  const token = params.get("token");

  const registerSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string()
      .min(12, t("validation.passwordMinLength"))
      .regex(/[A-Z]/, t("validation.passwordUppercase"))
      .regex(/[a-z]/, t("validation.passwordLowercase"))
      .regex(/[0-9]/, t("validation.passwordNumber"))
      .regex(/[^A-Za-z0-9]/, t("validation.passwordSymbol")),
    confirmPassword: z.string().min(1, t("validation.passwordMin")),
    firstName: z.string().min(1, t("validation.firstNameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordsNoMatch"),
    path: ["confirmPassword"],
  });

  type RegisterForm = z.infer<typeof registerSchema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  // Non redirigere automaticamente se l'utente è già loggato
  // Mostra invece un messaggio per fare logout

  useEffect(() => {
    if (!token) {
      setVerifyingToken(false);
      setInviteError(t("register.missingToken"));
      return;
    }

    fetch(`/api/auth/verify-invite/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token non valido");
        return res.json();
      })
      .then((data) => {
        setInviteEmail(data.email);
        form.setValue("email", data.email);
        setVerifyingToken(false);
      })
      .catch(() => {
        setInviteError(t("register.invalidToken"));
        setVerifyingToken(false);
      });
  }, [token, form, t]);

  const onSubmit = async (data: RegisterForm) => {
    if (!token) return;

    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        token,
      });
      toast({
        title: t("register.successTitle"),
        description: t("register.successDescription"),
      });
      navigate("/area-riservata");
    } catch (error: any) {
      toast({
        title: t("register.errorTitle"),
        description: error.message || t("register.errorDescription"),
        variant: "destructive",
      });
    }
  };

  if (isLoading || verifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={legalitLogo} alt="Legalit" className="h-12 w-auto" loading="lazy" decoding="async" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t("register.invalidInvite")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{inviteError}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => navigate("/")}
            >
              {t("register.backHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={legalitLogo} alt="Legalit" className="h-12 w-auto" loading="lazy" decoding="async" />
            </div>
            <div>
              <CardTitle className="text-2xl">Sei già connesso</CardTitle>
              <CardDescription className="mt-2">
                Per registrare un nuovo account partner, devi prima effettuare il logout.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Questo link di invito è per: <strong>{inviteEmail}</strong>
              </AlertDescription>
            </Alert>
            <Button
              className="w-full"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                window.location.reload();
              }}
            >
              Effettua Logout e Continua
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate("/area-riservata")}
            >
              Torna all'Area Riservata
            </Button>
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
            <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
            <CardDescription className="mt-2">
              {t("register.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("login.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.firstName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mario"
                          data-testid="input-first-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.lastName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rossi"
                          data-testid="input-last-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                        data-testid="input-password"
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
                        placeholder="••••••••"
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering}
                data-testid="button-register-submit"
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {t("register.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
