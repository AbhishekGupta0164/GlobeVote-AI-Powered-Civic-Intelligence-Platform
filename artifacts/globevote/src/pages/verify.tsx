import { useState } from "react";
import { useVerifyClaim, useGetRecentClaims } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Search, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function Verify() {
  const [claim, setClaim] = useState("");
  const verifyClaim = useVerifyClaim();
  const { data: recentClaims, isLoading } = useGetRecentClaims({ limit: 10 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;
    verifyClaim.mutate({ data: { claim } });
  };

  const getVerdictColor = (verdict: string) => {
    switch(verdict) {
      case 'true': return 'bg-emerald-500 text-white';
      case 'mostly-true': return 'bg-emerald-400 text-white';
      case 'mixed': return 'bg-amber-500 text-white';
      case 'mostly-false': return 'bg-rose-500 text-white';
      case 'false': return 'bg-rose-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes('true')) return <ShieldCheck className="h-5 w-5" />;
    if (verdict.includes('false')) return <ShieldAlert className="h-5 w-5" />;
    return <ShieldQuestion className="h-5 w-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Misinformation Firewall</h1>
        <p className="text-muted-foreground">Verify political claims instantly using our fact-checking engine.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enter a claim to verify</label>
              <Textarea 
                value={claim}
                onChange={e => setClaim(e.target.value)}
                placeholder="e.g. A new law requires voters to show two forms of photo ID in the upcoming election."
                className="min-h-[100px] text-lg bg-background"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!claim.trim() || verifyClaim.isPending}>
              {verifyClaim.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                <><Search className="mr-2 h-4 w-4" /> Verify Claim</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {verifyClaim.isSuccess && verifyClaim.data && (
        <Card className="border-2 overflow-hidden shadow-lg animate-in slide-in-from-top-4">
          <div className={`h-2 ${getVerdictColor(verifyClaim.data.verdict)}`} />
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${getVerdictColor(verifyClaim.data.verdict)} hover:${getVerdictColor(verifyClaim.data.verdict)} border-none px-3 py-1 uppercase tracking-widest flex items-center gap-2`}>
                {getVerdictIcon(verifyClaim.data.verdict)}
                {verifyClaim.data.verdict.replace('-', ' ')}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">Confidence: {verifyClaim.data.confidence}%</span>
            </div>
            <CardTitle className="text-xl">"{verifyClaim.data.claim}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">{verifyClaim.data.explanation}</p>
            {verifyClaim.data.sources && verifyClaim.data.sources.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Sources</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {verifyClaim.data.sources.map((source, i) => (
                    <li key={i} className="text-sm">{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 pt-8 border-t">
        <h2 className="text-xl font-bold">Recent Verifications</h2>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {recentClaims?.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="shrink-0">
                    <Badge className={`${getVerdictColor(item.verdict)} hover:${getVerdictColor(item.verdict)} border-none px-2 py-0.5 text-[10px] uppercase tracking-wider`}>
                      {item.verdict.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">"{item.claim}"</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
