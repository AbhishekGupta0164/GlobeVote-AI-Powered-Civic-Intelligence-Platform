import { useState } from "react";
import {
  useListElectoralSystems,
  useGetElectoralSystem,
  useSimulateElection,
  getGetElectoralSystemQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PARTY_COLORS = ["#1a4fb5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

interface Party { name: string; voteShare: number; color: string; }

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function Systems() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSim, setShowSim] = useState(false);
  const [simSystemId, setSimSystemId] = useState("pr");
  const [totalSeats, setTotalSeats] = useState(100);
  const [parties, setParties] = useState<Party[]>([
    { name: "Party A", voteShare: 40, color: PARTY_COLORS[0] },
    { name: "Party B", voteShare: 30, color: PARTY_COLORS[1] },
    { name: "Party C", voteShare: 20, color: PARTY_COLORS[2] },
    { name: "Party D", voteShare: 10, color: PARTY_COLORS[3] },
  ]);

  const { data: systems, isLoading: systemsLoading } = useListElectoralSystems();
  const { data: detail } = useGetElectoralSystem(selectedId!, {
    query: { enabled: !!selectedId, queryKey: getGetElectoralSystemQueryKey(selectedId!) },
  });

  const simulate = useSimulateElection();
  const { toast } = useToast();

  function updatePartyShare(idx: number, val: number) {
    setParties((prev) => prev.map((p, i) => (i === idx ? { ...p, voteShare: val } : p)));
  }

  function runSimulation() {
    const total = parties.reduce((s, p) => s + p.voteShare, 0);
    if (Math.abs(total - 100) > 1) {
      toast({ title: "Vote shares must sum to 100%", description: `Current total: ${total}%`, variant: "destructive" });
      return;
    }
    simulate.mutate({ data: { systemId: simSystemId, totalSeats, parties } });
  }

  if (showSim) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" onClick={() => setShowSim(false)} data-testid="button-back-systems">
          <ArrowLeft className="h-4 w-4" /> Back to Systems
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Electoral Systems Simulator</h1>
        <p className="text-muted-foreground mb-8">Adjust vote shares and see how different systems translate votes to seats.</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Electoral System</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(systems || []).map((s) => (
                    <Button key={s.id} data-testid={`button-system-${s.id}`} variant={simSystemId === s.id ? "default" : "outline"} size="sm" onClick={() => setSimSystemId(s.id)} className="text-xs">{s.abbreviation}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Total Seats: {totalSeats}</Label>
                <Slider data-testid="slider-total-seats" value={[totalSeats]} onValueChange={([v]) => setTotalSeats(v)} min={50} max={650} step={10} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Party Vote Shares</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {parties.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="ml-auto text-sm font-bold" style={{ color: p.color }}>{p.voteShare}%</span>
                  </div>
                  <Slider data-testid={`slider-party-${i}`} value={[p.voteShare]} onValueChange={([v]) => updatePartyShare(i, v)} min={0} max={80} step={1} />
                </div>
              ))}
              <div className="text-xs text-muted-foreground text-right">Total: {parties.reduce((s, p) => s + p.voteShare, 0)}%</div>
            </CardContent>
          </Card>
        </div>

        <Button data-testid="button-run-simulation" onClick={runSimulation} disabled={simulate.isPending} className="gap-2 mb-6" size="lg">
          <Play className="h-4 w-4" />
          {simulate.isPending ? "Simulating..." : "Run Simulation"}
        </Button>

        {simulate.data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Seat Allocation Results</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={simulate.data.parties}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} seats`, "Seats"]} />
                    <Bar dataKey="seats" radius={[4, 4, 0, 0]}>
                      {simulate.data.parties.map((p, i) => <Cell key={i} fill={p.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/40 rounded-lg">
                  <p className="text-sm text-foreground font-medium mb-1">Gallagher Index: <span className="text-primary font-bold">{simulate.data.gallagherIndex}</span></p>
                  <p className="text-sm text-muted-foreground">{simulate.data.summary}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Electoral Systems Lab</h1>
          <p className="text-muted-foreground text-lg">Explore how different systems translate votes into political power.</p>
        </div>
        <Button data-testid="button-open-simulator" onClick={() => setShowSim(true)} className="gap-2 shrink-0">
          <Play className="h-4 w-4" /> Open Simulator
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)
        ) : (systems || []).map((s) => (
          <Card key={s.id} data-testid={`card-system-${s.id}`} className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200" onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-primary/15 text-primary border-0 mb-2">{s.abbreviation}</Badge>
                  <h3 className="font-bold text-foreground leading-tight">{s.name}</h3>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{s.countriesUsing} countries</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
              <div className="space-y-2">
                <ScoreBar label="Proportionality" value={s.proportionalityScore} color="#1a4fb5" />
                <ScoreBar label="Simplicity" value={s.simplicityScore} color="#f59e0b" />
                <ScoreBar label="Fairness" value={s.fairnessScore} color="#10b981" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && detail && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 overflow-hidden">
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{detail.name} — Deep Dive</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> How it works
                    </h4>
                    <ol className="space-y-2">
                      {(detail.howItWorks as string[]).map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="shrink-0 font-bold text-primary">{i + 1}.</span>{step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2">Advantages</h4>
                      <ul className="space-y-1">
                        {(detail.pros as string[]).map((p, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500">+</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-2">Disadvantages</h4>
                      <ul className="space-y-1">
                        {(detail.cons as string[]).map((c, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-red-500">-</span>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">History: </span>{detail.historyAndOrigin}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
