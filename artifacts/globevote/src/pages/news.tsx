import { useState } from "react";
import { useListNews } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const BIAS_CONFIG: Record<string, { label: string; pct: number }> = {
  "left": { label: "Left", pct: 0 },
  "center-left": { label: "Center-Left", pct: 25 },
  "center": { label: "Center", pct: 50 },
  "center-right": { label: "Center-Right", pct: 75 },
  "right": { label: "Right", pct: 100 },
  "unknown": { label: "Unknown", pct: 50 },
};

const TOPICS = ["all", "elections", "misinformation", "civic-education", "voting-technology"];

function BiasBar({ bias }: { bias: string }) {
  const info = BIAS_CONFIG[bias] || BIAS_CONFIG.unknown;
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground w-3">L</span>
      <div className="flex-1 h-1.5 bg-gradient-to-r from-blue-500 via-gray-300 to-red-500 rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-foreground/40 rounded-full shadow-sm"
          style={{ left: `calc(${info.pct}% - 6px)` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-3">R</span>
      <span className="text-xs text-muted-foreground ml-1">{info.label}</span>
    </div>
  );
}

export default function News() {
  const [topic, setTopic] = useState("all");

  const { data: articles, isLoading } = useListNews({
    topic: topic !== "all" ? topic : undefined,
    limit: 30,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Civic News</h1>
        <p className="text-muted-foreground text-lg">Curated election and civic news with source bias indicators.</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {TOPICS.map((t) => (
          <Button key={t} data-testid={`button-topic-${t}`} variant={topic === t ? "default" : "outline"} size="sm" onClick={() => setTopic(t)}>
            {t === "all" ? "All Topics" : t.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No articles found</p>
        </div>
      ) : (
        <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          {articles.map((article) => (
            <motion.div key={article.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
              <Card data-testid={`card-article-${article.id}`} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.topic.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                      <TrendingUp className="h-3 w-3" />{Math.round(article.relevanceScore * 100)}% relevance
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 leading-snug">{article.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>
                  <BiasBar bias={article.biasRating} />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">{article.source}</span>
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-article-${article.id}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Read more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
