import { useState, useEffect, useRef } from "react";
import {
  useListQuizQuestions,
  useSubmitQuizAnswer,
  useGetLeaderboard,
} from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Timer, Trophy, CheckCircle2, XCircle, Zap, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Category = "voting-basics" | "electoral-systems" | "civic-rights" | "world-elections" | "misinformation";
type Difficulty = "beginner" | "intermediate" | "expert";
type QuizState = "setup" | "playing" | "review" | "finished";

const CATEGORY_LABELS: Record<Category, string> = {
  "voting-basics": "Voting Basics",
  "electoral-systems": "Electoral Systems",
  "civic-rights": "Civic Rights",
  "world-elections": "World Elections",
  "misinformation": "Misinformation",
};

const DIFF_COLORS: Record<Difficulty, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function Quiz() {
  const sessionId = getSessionId();
  const { toast } = useToast();

  const [state, setState] = useState<QuizState>("setup");
  const [category, setCategory] = useState<Category | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [results, setResults] = useState<Array<{ correct: boolean; explanation: string; correctOption: number; xpEarned: number; streakBonus: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: questions } = useListQuizQuestions({
    category: category !== "all" ? category : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    limit: 10,
  });

  const { data: leaderboard } = useGetLeaderboard({ period: "weekly", limit: 10 });
  const submitAnswer = useSubmitQuizAnswer();

  const currentQ = (state === "playing" || state === "review") && questions ? questions[currentIdx] : null;

  useEffect(() => {
    if (state === "playing" && selected === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(-1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current!); };
  }, [state, currentIdx]);

  function startQuiz() {
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setXpTotal(0);
    setResults([]);
    setTimeLeft(30);
    setState("playing");
  }

  function handleSubmit(optionIdx: number) {
    if (!currentQ || submitAnswer.isPending || selected !== null) return;
    clearInterval(timerRef.current!);
    setSelected(optionIdx);
    setState("review");

    const timeTaken = 30 - timeLeft;
    submitAnswer.mutate(
      { data: { questionId: currentQ.id, selectedOption: optionIdx, sessionId, timeTakenSeconds: timeTaken } },
      {
        onSuccess: (result) => {
          setResults((prev) => [...prev, result]);
          if (result.correct) {
            setScore((s) => s + 1);
            setXpTotal((x) => x + result.xpEarned);
            toast({ title: `+${result.xpEarned} XP earned!`, description: result.streakBonus > 0 ? `Streak bonus: +${result.streakBonus} XP` : "Keep it up!" });
          }
          setTimeout(() => {
            if (questions && currentIdx < questions.length - 1) {
              setCurrentIdx((i) => i + 1);
              setSelected(null);
              setTimeLeft(30);
              setState("playing");
            } else {
              setState("finished");
            }
          }, 2000);
        },
      }
    );
  }

  if (state === "setup") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <BrainCircuit className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Civic Quiz</h1>
          <p className="text-muted-foreground">Test your civic knowledge. Earn XP and climb the leaderboard.</p>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Quiz Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Difficulty</label>
              <div className="flex gap-2 flex-wrap">
                {(["all", "beginner", "intermediate", "expert"] as const).map((d) => (
                  <Button key={d} data-testid={`button-difficulty-${d}`} variant={difficulty === d ? "default" : "outline"} size="sm" onClick={() => setDifficulty(d)}>
                    {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button data-testid="button-start-quiz" onClick={startQuiz} className="w-full gap-2 h-12 text-lg" size="lg" disabled={!questions}>
          <Zap className="h-5 w-5" /> Start Quiz
        </Button>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Weekly Leaderboard</h2>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          {!leaderboard ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
          ) : (leaderboard).map((entry) => (
            <div key={entry.sessionId} data-testid={`row-leaderboard-${entry.rank}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${entry.rank === 1 ? "bg-amber-400 text-amber-900" : entry.rank === 2 ? "bg-gray-300 text-gray-700" : entry.rank === 3 ? "bg-amber-700 text-amber-100" : "bg-muted text-muted-foreground"}`}>
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{entry.displayName}</p>
                <p className="text-xs text-muted-foreground">{entry.level} · {entry.accuracy}% accuracy</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{entry.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "finished") {
    const accuracy = questions ? Math.round((score / questions.length) * 100) : 0;
    return (
      <motion.div className="p-6 max-w-lg mx-auto text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Trophy className="h-20 w-20 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
        <p className="text-muted-foreground mb-8">Here's how you did</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{score}/{questions?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Correct</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">+{xpTotal}</div>
            <div className="text-xs text-muted-foreground mt-1">XP Earned</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{accuracy}%</div>
            <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
          </CardContent></Card>
        </div>
        <Button data-testid="button-play-again" onClick={startQuiz} className="w-full gap-2 h-12" size="lg">
          <RotateCcw className="h-4 w-4" /> Play Again
        </Button>
        <Button variant="ghost" className="w-full mt-2" onClick={() => setState("setup")} data-testid="button-back-to-setup">
          Change Settings
        </Button>
      </motion.div>
    );
  }

  if (!currentQ || !questions) return null;

  const lastResult = state === "review" ? results[results.length - 1] : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground font-medium">Question {currentIdx + 1} of {questions.length}</div>
        <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timeLeft <= 10 ? "text-red-500" : "text-foreground"}`}>
          <Timer className="h-4 w-4" />{timeLeft}s
        </div>
      </div>

      <Progress value={(currentIdx / questions.length) * 100} className="mb-6 h-2" />

      <div className="flex gap-2 mb-6">
        <Badge className={DIFF_COLORS[currentQ.difficulty as Difficulty]}>{currentQ.difficulty}</Badge>
        <Badge variant="outline">{CATEGORY_LABELS[currentQ.category as Category] || currentQ.category}</Badge>
        <Badge variant="outline" className="ml-auto">{currentQ.xpReward} XP</Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-lg font-semibold text-foreground leading-relaxed">{currentQ.question}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(currentQ.options as string[]).map((opt, i) => {
          let optClass = "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
          if (selected !== null) {
            if (lastResult && i === lastResult.correctOption) optClass = "border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default";
            else if (i === selected && !lastResult?.correct) optClass = "border-red-500 bg-red-50 dark:bg-red-900/20 cursor-default";
            else optClass = "border-border opacity-50 cursor-default";
          }
          return (
            <motion.button
              key={i}
              data-testid={`button-option-${i}`}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-center gap-3 ${optClass}`}
              onClick={() => selected === null && handleSubmit(i)}
              whileHover={selected === null ? { scale: 1.01 } : {}}
              whileTap={selected === null ? { scale: 0.99 } : {}}
            >
              <span className="shrink-0 w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-foreground font-medium">{opt}</span>
              {selected !== null && lastResult && i === lastResult.correctOption && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
              {selected !== null && i === selected && !lastResult?.correct && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl ${lastResult.correct ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"}`}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              {lastResult.correct ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
              <span className={lastResult.correct ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                {lastResult.correct ? `Correct! +${lastResult.xpEarned} XP` : "Incorrect"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{lastResult.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
