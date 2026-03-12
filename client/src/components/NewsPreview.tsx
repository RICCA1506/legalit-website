import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, ExternalLink, Newspaper } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import NewsArticleModal from "./NewsArticleModal";
import OptimizedPicture from "./OptimizedPicture";
import LandoReveal from "./LandoReveal";
import StaggerContainer, { staggerItemVariants } from "./StaggerContainer";
import { useLanguage } from "@/lib/i18n";
import type { NewsArticle } from "@shared/schema";

function CurtainNewsCard({ article, onClick, autoT, t }: {
  article: NewsArticle;
  onClick: () => void;
  autoT: (s: string) => string;
  t: (key: string) => string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const imageHeight = useTransform(scrollYProgress, [0.3, 0.7], [180, 0]);
  const imageOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);

  return (
    <Card
      ref={cardRef}
      className="group overflow-hidden cursor-pointer border-0 bg-background h-full flex flex-col"
      onClick={onClick}
      data-testid={`card-news-preview-${article.id}`}
    >
      <motion.div
        className="relative overflow-hidden bg-muted flex items-center justify-center"
        style={{ height: imageHeight, opacity: imageOpacity }}
      >
        <Newspaper className="h-10 w-10 text-muted-foreground/40 absolute" />
        <OptimizedPicture
          src={article.imageUrl || "/attached_assets/unsplash-law-default.jpg"}
          alt={article.title}
          className="w-full h-full object-cover relative z-10"
          style={(() => {
            const pos = article.imagePosition;
            const zoom = article.imageZoom || 100;
            let ox = 50, oy = 50;
            if (pos && pos.includes(",")) {
              const [x, y] = pos.split(",").map(Number);
              if (!isNaN(x)) ox = x;
              if (!isNaN(y)) oy = y;
            }
            if (zoom === 100 && ox === 50 && oy === 50) return { objectPosition: "center" };
            return {
              objectPosition: `${ox}% ${oy}%`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: `${ox}% ${oy}%`,
            };
          })()}
        />
        {article.readTime && (
          <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </div>
        )}
      </motion.div>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <Badge variant="secondary" className="rounded-full text-xs">
            {autoT(article.category)}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {autoT(article.title)}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {article.excerpt ? autoT(article.excerpt) : ""}
        </p>
        <div className="flex items-center justify-between mt-auto flex-wrap gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {article.createdAt
              ? new Date(article.createdAt).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </span>
          <div className="flex items-center gap-3">
            {article.linkedinUrl && (
              <a
                href={article.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A66C2] hover:underline transition-colors flex items-center gap-1 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
                data-testid={`link-linkedin-preview-${article.id}`}
              >
                <SiLinkedin className="h-4 w-4" />
                LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <span className="text-sm font-medium text-primary flex items-center gap-1">
              {t("news.read")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewsPreview() {
  const { t, autoT } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const { data: newsArticles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const previewArticles = newsArticles.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-24 bg-card">
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-primary text-sm uppercase tracking-[0.2em] mb-4 block">
                {t("news.latestUpdates")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("news.legalNewsHeading")}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (previewArticles.length === 0) return null;

  return (
    <section className="py-24 bg-card">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="text-primary text-sm uppercase tracking-[0.2em] mb-4 block">
              {t("news.latestUpdates")}
            </span>
            <LandoReveal
              text={t("news.legalNewsHeading")}
              as="h2"
              className="text-3xl md:text-4xl mb-4 text-brutalist"
              delay={100}
            />
            <p className="text-muted-foreground max-w-xl text-editorial">
              {t("news.legalNewsSubtitle")}
            </p>
          </div>
          <Link href="/news" className="mt-6 md:mt-0">
            <Button variant="outline" className="rounded-full" data-testid="button-news-all">
              {t("news.allNews")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewArticles.map((article) => (
            <motion.div
              key={article.id}
              variants={staggerItemVariants(30, 0.5)}
            >
              <CurtainNewsCard
                article={article}
                onClick={() => setSelectedArticle(article)}
                autoT={autoT}
                t={t}
              />
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
      
      <NewsArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </section>
  );
}
