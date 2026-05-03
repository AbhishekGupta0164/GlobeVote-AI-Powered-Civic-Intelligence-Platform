import { useState } from "react";
import { useListCountries } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const REGIONS = ["All", "Americas", "Europe", "Asia", "Africa", "Oceania", "Middle East"];

const SYSTEM_COLORS: Record<string, string> = {
  FPTP: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PR: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  MMP: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  STV: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  AV: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  MMM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Two-Round": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function Countries() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  const { data: countries, isLoading } = useListCountries({
    search: search || undefined,
    region: region !== "All" ? region : undefined,
  });

  const filtered = (countries ?? []).filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === "All" || c.region === region;
    return matchSearch && matchRegion;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Country Explorer</h1>
        <p className="text-muted-foreground text-lg">Explore electoral systems and voting procedures from countries worldwide.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-country-search"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger data-testid="select-region" className="w-full sm:w-48">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r === "All" ? "All Regions" : r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No countries found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.map((country) => (
            <motion.div
              key={country.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <Link href={`/countries/${country.id}`}>
                <Card
                  data-testid={`card-country-${country.id}`}
                  className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 h-full"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-4xl leading-none">{country.flag}</span>
                        <h3 className="font-bold text-base mt-2 text-foreground leading-tight">{country.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{country.region}</p>
                      </div>
                      <Badge className={`text-xs shrink-0 border-0 ${SYSTEM_COLORS[country.electoralSystem] || "bg-muted text-muted-foreground"}`}>
                        {country.electoralSystem}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {country.voterTurnout != null && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="text-muted-foreground">Turnout:</span>
                        <span className="font-semibold text-foreground">{country.voterTurnout}%</span>
                      </div>
                    )}
                    {country.registeredVoters != null && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">Voters:</span>
                        <span className="font-semibold text-foreground">
                          {country.registeredVoters >= 1000000
                            ? `${(country.registeredVoters / 1000000).toFixed(0)}M`
                            : `${(country.registeredVoters / 1000).toFixed(0)}K`}
                        </span>
                      </div>
                    )}
                    {country.nextElectionDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="text-muted-foreground">Next:</span>
                        <span className="font-semibold text-foreground">
                          {new Date(country.nextElectionDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
