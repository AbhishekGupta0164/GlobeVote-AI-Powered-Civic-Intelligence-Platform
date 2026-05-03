import { useParams, Link } from "wouter";
import { useGetCountry, getGetCountryQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Users, TrendingUp, Calendar, Vote, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function CountryDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: country, isLoading } = useGetCountry(id!, { query: { enabled: !!id, queryKey: getGetCountryQueryKey(id!) } });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground text-lg">Country not found.</p>
        <Link href="/countries">
          <Button variant="outline" className="mt-4">Back to Countries</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href="/countries">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" data-testid="button-back-countries">
          <ArrowLeft className="h-4 w-4" />
          All Countries
        </Button>
      </Link>

      {/* Hero */}
      <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <span className="text-7xl leading-none">{country.flag}</span>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{country.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{country.region}</Badge>
                <Badge className="bg-primary/20 text-primary border-0">{country.electoralSystem}</Badge>
                <Badge variant="outline">Voting Age: {country.votingAge}+</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{country.overview}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {country.voterTurnout != null && (
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{country.voterTurnout}%</div>
              <div className="text-xs text-muted-foreground mt-1">Voter Turnout</div>
            </CardContent>
          </Card>
        )}
        {country.registeredVoters != null && (
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">
                {country.registeredVoters >= 1000000
                  ? `${(country.registeredVoters / 1000000).toFixed(0)}M`
                  : `${(country.registeredVoters / 1000).toFixed(0)}K`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Registered Voters</div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4 text-center">
            <Vote className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{country.votingAge}+</div>
            <div className="text-xs text-muted-foreground mt-1">Voting Age</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{country.registrationDeadlineDays}d</div>
            <div className="text-xs text-muted-foreground mt-1">Reg. Deadline</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Voting Process */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              How to Vote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(country.votingProcess as string[]).map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ID Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              ID Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(country.idRequirements as string[]).map((req, i) => (
              <div key={i} className="flex gap-2 items-start text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-foreground">{req}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Key Facts */}
      {(country.keyFacts as string[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Facts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {(country.keyFacts as string[]).map((fact, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-muted-foreground">{fact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
