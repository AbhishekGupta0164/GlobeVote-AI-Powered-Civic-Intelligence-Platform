import { useState } from "react";
import { useListElections } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Status = "upcoming" | "ongoing" | "completed";

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  ongoing: { label: "Live", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: Loader2 },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground", icon: CheckCircle },
};

const TYPE_COLORS: Record<string, string> = {
  presidential: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  parliamentary: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  local: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  referendum: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  midterm: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

function getDaysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Elections() {
  const [status, setStatus] = useState<Status | "all">("all");

  const { data: elections, isLoading } = useListElections({
    status: status !== "all" ? status : undefined,
    limit: 50,
  });

  const statusBtns: Array<{ key: Status | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "ongoing", label: "Live" },
    { key: "completed", label: "Past" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Elections Hub</h1>
        <p className="text-muted-foreground text-lg">Track elections happening around the world.</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {statusBtns.map((btn) => (
          <Button
            key={btn.key}
            data-testid={`button-filter-${btn.key}`}
            variant={status === btn.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(btn.key)}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !elections || elections.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No elections found</p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {elections.map((election) => {
            const statusCfg = STATUS_CONFIG[election.status as Status] || STATUS_CONFIG.upcoming;
            const StatusIcon = statusCfg.icon;
            const daysUntil = election.status === "upcoming" ? getDaysUntil(election.date) : null;

            return (
              <motion.div
                key={election.id}
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
              >
                <Link href={`/elections/${election.id}`}>
                  <Card
                    data-testid={`card-election-${election.id}`}
                    className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  >
                    <CardContent className="p-5 flex gap-4 items-start">
                      <span className="text-3xl leading-none shrink-0 mt-1">{election.countryFlag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground leading-tight">{election.title}</h3>
                          <Badge className={`text-xs border-0 ${statusCfg.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                          </Badge>
                          <Badge className={`text-xs border-0 ${TYPE_COLORS[election.type] || ""}`}>
                            {election.type.charAt(0).toUpperCase() + election.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{election.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(election.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </span>
                          <span>{election.countryName}</span>
                        </div>
                      </div>
                      {daysUntil !== null && daysUntil > 0 && (
                        <div className="shrink-0 text-center">
                          <div className="text-2xl font-bold text-primary">{daysUntil}</div>
                          <div className="text-xs text-muted-foreground">days</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
