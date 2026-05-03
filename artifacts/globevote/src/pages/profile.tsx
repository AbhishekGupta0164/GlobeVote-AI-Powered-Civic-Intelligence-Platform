import {
  useGetUserProgress,
  useGetUserAchievements,
  getGetUserProgressQueryKey,
  getGetUserAchievementsQueryKey,
} from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User, Star, Flame, Globe, MessageSquare, ShieldCheck, Target, Trophy } from "lucide-react";

const LEVEL_CONFIG: Record<string, { label: string; gradientFrom: string; gradientTo: string }> = {
  "beginner": { label: "Beginner", gradientFrom: "#9ca3af", gradientTo: "#6b7280" },
  "civic-learner": { label: "Civic Learner", gradientFrom: "#60a5fa", gradientTo: "#3b82f6" },
  "analyst": { label: "Analyst", gradientFrom: "#a78bfa", gradientTo: "#7c3aed" },
  "policy-expert": { label: "Policy Expert", gradientFrom: "#fbbf24", gradientTo: "#d97706" },
  "democracy-champion": { label: "Democracy Champion", gradientFrom: "#1a4fb5", gradientTo: "#2563eb" },
};

export default function Profile() {
  const sessionId = getSessionId();

  const { data: progress, isLoading: progressLoading } = useGetUserProgress(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetUserProgressQueryKey(sessionId) },
  });

  const { data: achievements, isLoading: achievementsLoading } = useGetUserAchievements(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetUserAchievementsQueryKey(sessionId) },
  });

  if (progressLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20 text-muted-foreground">
        <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Could not load profile</p>
        <p className="text-sm mt-1">Interact with the platform to create your civic profile.</p>
      </div>
    );
  }

  const levelCfg = LEVEL_CONFIG[progress.level] || LEVEL_CONFIG.beginner;

  const stats = [
    { icon: Target, label: "Questions Answered", value: progress.questionsAnswered, color: "text-primary" },
    { icon: Star, label: "Accuracy", value: `${progress.accuracy}%`, color: "text-green-500" },
    { icon: Flame, label: "Current Streak", value: progress.streak, color: "text-orange-500" },
    { icon: Globe, label: "Countries Explored", value: progress.countriesExplored, color: "text-blue-500" },
    { icon: ShieldCheck, label: "Claims Verified", value: progress.claimsVerified, color: "text-purple-500" },
    { icon: MessageSquare, label: "AI Conversations", value: progress.chatInteractions, color: "text-amber-500" },
  ];

  return (
    <motion.div className="p-6 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Level Card */}
      <div
        className="rounded-2xl p-8 mb-6 text-white"
        style={{ background: `linear-gradient(135deg, ${levelCfg.gradientFrom}, ${levelCfg.gradientTo})` }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{progress.displayName}</h1>
            <p className="text-white/80 text-sm">{levelCfg.label}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold">{progress.xp.toLocaleString()}</div>
            <div className="text-white/70 text-sm">Total XP</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>{levelCfg.label}</span>
            <span>{progress.xpToNextLevel} XP to next level</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (progress.xp / (progress.xp + progress.xpToNextLevel)) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
            {achievements && <Badge variant="secondary" className="ml-auto">{achievements.length} earned</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsLoading ? (
            <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : !achievements || achievements.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No achievements yet</p>
              <p className="text-sm mt-1">Complete quizzes and explore countries to earn badges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border bg-muted/30 text-center"
                  data-testid={`achievement-${a.id}`}
                >
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{a.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{a.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{a.category}</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Session: <code className="font-mono">{sessionId.slice(0, 8)}...</code>
        {progress.joinedAt && ` · Joined ${new Date(progress.joinedAt).toLocaleDateString()}`}
      </p>
    </motion.div>
  );
}
