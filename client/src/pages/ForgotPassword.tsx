import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
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
import { ArrowLeft, Loader2, Mail, CheckCircle, KeyRound } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Mode = "choose" | "reset-form" | "reset-sent" | "code-request" | "code-verify";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("choose");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeEmail, setCodeEmail] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const emailSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
  });

  const resetForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeEmailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onResetSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email: data.email });
      setMode("reset-sent");
    } catch (error: any) {
      toast({
        title: t("login.errorTitle"),
        description: error.message || t("forgotPassword.errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRequestCode = async (data: { email: string }) => {
    setIsSendingCode(true);
    try {
      await apiRequest("POST", "/api/auth/request-login-code", { email: data.email });
      setCodeEmail(data.email);
      setMode("code-verify");
      setCodeDigits(["", "", "", "", "", ""]);
      toast({
        title: t("login.codeSent"),
        description: t("login.codeSentDescription"),
      });
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      toast({
        title: t("login.errorTitle"),
        description: error.message || "Errore durante l'invio del codice",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleCodeDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCodeDigits = [...codeDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newCodeDigits[index + i] = d;
      });
      setCodeDigits(newCodeDigits);
      const nextIndex = Math.min(index + digits.length, 5);
      codeInputRefs.current[nextIndex]?.focus();
      if (newCodeDigits.every(d => d !== "")) {
        verifyCode(newCodeDigits.join(""));
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newCodeDigits = [...codeDigits];
    newCodeDigits[index] = digit;
    setCodeDigits(newCodeDigits);

    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (newCodeDigits.every(d => d !== "")) {
      verifyCode(newCodeDigits.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      const newCodeDigits = [...codeDigits];
      newCodeDigits[index - 1] = "";
      setCodeDigits(newCodeDigits);
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code: string) => {
    setIsVerifyingCode(true);
    try {
      await apiRequest("POST", "/api/auth/verify-login-code", {
        email: codeEmail,
        code,
      });
      toast({
        title: t("login.successTitle"),
        description: t("login.successDescription"),
      });
      window.location.href = "/area-riservata";
    } catch (error: any) {
      setCodeDigits(["", "", "", "", "", ""]);
      codeInputRefs.current[0]?.focus();
      toast({
        title: t("login.errorTitle"),
        description: t("login.codeError"),
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "choose":
        return t("forgotPassword.chooseMethod");
      case "reset-form":
        return t("forgotPassword.description");
      case "reset-sent":
        return t("forgotPassword.sentDescription");
      case "code-request":
        return t("login.sendCodeDescription");
      case "code-verify":
        return t("login.enterCodeDescription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={legalitLogo} alt="Legalit" className="h-12 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {mode === "code-request" || mode === "code-verify"
                ? t("forgotPassword.loginWithCode")
                : t("forgotPassword.title")}
            </CardTitle>
            <CardDescription className="mt-2">
              {getDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {mode === "choose" && (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => setMode("reset-form")}
                data-testid="button-choose-reset"
              >
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">{t("forgotPassword.resetOption")}</p>
                  <p className="text-xs text-muted-foreground">{t("forgotPassword.resetOptionDesc")}</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => setMode("code-request")}
                data-testid="button-choose-code"
              >
                <KeyRound className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">{t("forgotPassword.codeOption")}</p>
                  <p className="text-xs text-muted-foreground">{t("forgotPassword.codeOptionDesc")}</p>
                </div>
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full mt-2" data-testid="button-back-to-login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("forgotPassword.backToLogin")}
                </Button>
              </Link>
            </div>
          )}

          {mode === "reset-form" && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nome@legalit.it"
                          autoComplete="email"
                          data-testid="input-forgot-email"
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
                  disabled={isSubmitting}
                  data-testid="button-forgot-submit"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {t("forgotPassword.submit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("choose")}
                  data-testid="button-back-to-choose"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("forgotPassword.backToOptions")}
                </Button>
              </form>
            </Form>
          )}

          {mode === "reset-sent" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.checkEmail")}
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("forgotPassword.backToLogin")}
                </Button>
              </Link>
            </div>
          )}

          {mode === "code-request" && (
            <Form {...codeEmailForm}>
              <form onSubmit={codeEmailForm.handleSubmit(onRequestCode)} className="space-y-4">
                <FormField
                  control={codeEmailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nome@legalit.it"
                          autoComplete="email"
                          data-testid="input-code-email"
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
                  disabled={isSendingCode}
                  data-testid="button-send-code"
                >
                  {isSendingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  {t("login.sendCode")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode("choose")}
                  data-testid="button-back-to-choose"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("forgotPassword.backToOptions")}
                </Button>
              </form>
            </Form>
          )}

          {mode === "code-verify" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-md">
                <KeyRound className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm">{t("login.enterCodeDescription")}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {codeEmail}
              </p>
              <div className="flex justify-center gap-2">
                {codeDigits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { codeInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (pasted) handleCodeDigitChange(0, pasted);
                    }}
                    className="w-11 h-12 text-center text-xl font-mono font-bold"
                    disabled={isVerifyingCode}
                    data-testid={`input-code-digit-${index}`}
                  />
                ))}
              </div>
              {isVerifyingCode && (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  codeEmailForm.setValue("email", codeEmail);
                  setMode("code-request");
                }}
                disabled={isVerifyingCode}
                data-testid="button-resend-code"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("login.resendCode")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("choose")}
                disabled={isVerifyingCode}
                data-testid="button-back-to-choose"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("forgotPassword.backToOptions")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
