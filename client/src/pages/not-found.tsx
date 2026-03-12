import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">404</h1>
          <p className="text-xl font-semibold mb-2">{t("notFound.title")}</p>
          <p className="text-muted-foreground mb-6">
            {t("notFound.description")}
          </p>
          <Link href="/">
            <Button className="rounded-full">
              {t("register.backHome")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
