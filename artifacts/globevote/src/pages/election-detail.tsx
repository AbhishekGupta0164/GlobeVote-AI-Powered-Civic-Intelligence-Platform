import { useParams, Link } from "wouter";
import { useGetElection, getGetElectionQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: election, isLoading } = useGetElection(id!, { query: { enabled: !!id, queryKey: getGetElectionQueryKey(id!) } });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground text-lg">Election not found.</p>
        <Link href="/elections"><Button variant="outline" className="mt-4">Back to Elections</Button></Link>
      </div>
    );
  }

  const results = election.results as Array<{ partyName: string; partyColor: string; voteShare: number; seats?: number }> | null;
  const candidates = election.candidates as Array<{ name: string; party: string; partyColor: string; description: string }>;

  return (
    <motion.div className="p-6 max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link href="/elections">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" data-testid="button-back-elections">
          <ArrowLeft className="h-4 w-4" /> All Elections
        </Button>
      </Link>

      <Card className="mb-6 border-0 bg-gradient-to-br from-primary/10 to-background">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{election.countryFlag}</span>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={election.status === "completed" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"}>
                  {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                </Badge>
                <Badge variant="outline">{election.type.charAt(0).toUpperCase() + election.type.slice(1)}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{election.title}</h1>
              <p className="text-muted-foreground">{election.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(election.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
                {election.totalSeats && <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{election.totalSeats} seats</span>}
                {election.turnout && <span>{election.turnout}% turnout</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Election Results</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={results} dataKey="voteShare" nameKey="partyName" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
                    {results.map((r, i) => <Cell key={i} fill={r.partyColor} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Vote Share"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.partyColor }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">{r.partyName}</span>
                        <span className="text-sm font-bold text-foreground">{r.voteShare}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.voteShare}%`, backgroundColor: r.partyColor }} />
                      </div>
                      {r.seats != null && <p className="text-xs text-muted-foreground mt-0.5">{r.seats} seats</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {candidates && candidates.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Candidates / Parties</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {candidates.map((c, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: c.partyColor }}>
                    {(c.name || c.party)[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{c.name || c.party}</p>
                    <p className="text-xs text-muted-foreground">{c.party}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
