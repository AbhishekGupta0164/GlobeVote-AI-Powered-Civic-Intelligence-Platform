import { useGetDashboardStats } from "@workspace/api-client-react";
import { Globe, Vote, BrainCircuit, ShieldCheck, Users, BarChart3, ArrowRight, Sparkles, Zap, MessageSquare } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { useRef, useEffect, useState } from "react";

/* ── Floating orb ────────────────────────────────────────────── */
function Orb({ cx, cy, r, color, delay = 0 }: { cx: string; cy: string; r: string; color: string; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: cx, top: cy, width: r, height: r, background: color, filter: "blur(80px)", transform: "translate(-50%,-50%)" }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.65, 0.45] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ── Animated counter ────────────────────────────────────────── */
function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display}</>;
}

/* ── Tilt card ───────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STATS = [
  { icon: Globe,        key: "totalCountries",         label: "Countries",       color: "#60a5fa" },
  { icon: Vote,         key: "upcomingElections",       label: "Upcoming",        color: "#a78bfa" },
  { icon: BarChart3,    key: "electoralSystemsCovered", label: "Systems",         color: "#34d399" },
  { icon: BrainCircuit, key: "questionsInDatabase",     label: "Quiz Questions",  color: "#fbbf24" },
  { icon: ShieldCheck,  key: "claimsVerified",          label: "Fact-Checks",     color: "#f472b6" },
  { icon: Users,        key: "activeUsers",             label: "Active Users",    color: "#fb923c" },
] as const;

const FEATURES = [
  {
    href: "/chat",
    icon: MessageSquare,
    gradient: "from-blue-500 to-indigo-600",
    glow: "rgba(99,102,241,0.35)",
    title: "AI Civic Assistant",
    desc: "Ask anything about voting rights, elections, or how democracy works — in plain language or expert depth.",
    cta: "Start a conversation",
  },
  {
    href: "/verify",
    icon: ShieldCheck,
    gradient: "from-rose-500 to-pink-600",
    glow: "rgba(244,63,94,0.35)",
    title: "Misinformation Firewall",
    desc: "Submit any political claim and get an instant AI verdict with source confidence and manipulation flags.",
    cta: "Verify a claim",
  },
  {
    href: "/systems",
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.35)",
    title: "Electoral Systems Lab",
    desc: "Simulate how FPTP, PR, MMP and others translate votes to seats. Compare Gallagher indices live.",
    cta: "Run a simulation",
  },
  {
    href: "/quiz",
    icon: BrainCircuit,
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.35)",
    title: "Civic Quiz",
    desc: "Timed questions across five categories. Earn XP, build streaks, and climb the weekly leaderboard.",
    cta: "Test your knowledge",
  },
];

export default function Home() {
  const { data: stats } = useGetDashboardStats();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #05070f 0%, #090d1a 50%, #07111f 100%)" }}
    >
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Ambient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Orb cx="15%"  cy="20%"  r="520px" color="rgba(29,78,216,0.22)"  delay={0} />
        <Orb cx="80%"  cy="12%"  r="400px" color="rgba(124,58,237,0.18)" delay={2} />
        <Orb cx="90%"  cy="60%"  r="480px" color="rgba(6,182,212,0.12)"  delay={4} />
        <Orb cx="10%"  cy="75%"  r="360px" color="rgba(16,185,129,0.10)" delay={1} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-24 space-y-24">

        {/* ════════════════════════════════ HERO ════════════════════════════════ */}
        <section className="text-center flex flex-col items-center gap-8">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#93c5fd",
                backdropFilter: "blur(8px)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Civic Intelligence Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.02] tracking-tight max-w-5xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ color: "white" }}
          >
            Democracy,{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              demystified.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-lg sm:text-xl max-w-2xl leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Understand global elections, fact-check claims in seconds, and simulate
            electoral systems with the depth of a political scientist — powered by AI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link href="/chat">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm cursor-pointer select-none"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "white",
                  boxShadow: "0 0 32px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                <Zap className="h-4 w-4" />
                Ask AI Assistant
              </motion.span>
            </Link>
            <Link href="/elections">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm cursor-pointer select-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Explore Elections
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        </section>

        {/* ════════════════════════════════ STATS ════════════════════════════════ */}
        <motion.section
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {STATS.map(({ icon: Icon, key, label, color }) => (
            <motion.div
              key={key}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="rounded-2xl p-4 flex flex-col gap-3 cursor-default"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${color}22` }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color }}>
                  {stats ? <Counter value={(stats as any)[key] ?? 0} /> : "—"}
                </div>
                <div className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ════════════════════════════════ FEATURE CARDS ════════════════════════════════ */}
        <section>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ color: "white" }}
            >
              Everything you need to understand{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                democracy
              </span>
            </h2>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
              Four powerful tools. One platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ href, icon: Icon, gradient, glow, title, desc, cta }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard>
                  <Link href={href}>
                    <motion.div
                      whileHover={{ boxShadow: `0 0 48px ${glow}, 0 0 0 1px rgba(255,255,255,0.12)` }}
                      transition={{ duration: 0.25 }}
                      className="group h-full rounded-2xl p-7 flex flex-col gap-5 cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}
                        style={{ boxShadow: `0 4px 20px ${glow}` }}
                      >
                        <Icon className="h-5.5 w-5.5 text-white" />
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                        <span className="group-hover:text-white transition-colors">{cta}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════ ELECTIONS + CLAIMS ════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Featured Elections */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Featured Elections</h2>
              <Link href="/elections">
                <span className="text-xs font-semibold flex items-center gap-1 hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.featuredElections?.slice(0, 4).map((election, i) => {
                const daysUntil = Math.ceil((new Date(election.date).getTime() - Date.now()) / 86400000);
                return (
                  <motion.div
                    key={election.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link href={`/elections/${election.id}`}>
                      <div
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <span className="text-3xl shrink-0">{election.countryFlag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">{election.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {new Date(election.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        {daysUntil > 0 && daysUntil < 500 && (
                          <div className="text-right shrink-0">
                            <div className="text-lg font-black" style={{ color: "#60a5fa" }}>{daysUntil}</div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>days</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {(!stats?.featuredElections || stats.featuredElections.length === 0) && (
                <div
                  className="text-center p-10 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">No featured elections at this time.</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Recent Fact-Checks */}
          <motion.section
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Live Fact-Checks</h2>
              <Link href="/verify">
                <span className="text-xs font-semibold flex items-center gap-1 hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Verify a claim <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentClaims?.slice(0, 4).map((claim, i) => {
                const verdictColor =
                  claim.verdict === "true" ? "#10b981" :
                  claim.verdict === "mostly-true" ? "#34d399" :
                  claim.verdict === "mixed" ? "#f59e0b" :
                  claim.verdict === "mostly-false" ? "#f43f5e" :
                  claim.verdict === "false" ? "#e11d48" : "#6b7280";
                return (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm italic leading-snug line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                        "{claim.claim}"
                      </p>
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${verdictColor}22`, color: verdictColor, border: `1px solid ${verdictColor}44` }}
                      >
                        {claim.verdict.replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: "rgba(255,255,255,0.35)" }}>{claim.explanation}</p>
                  </motion.div>
                );
              })}
              {(!stats?.recentClaims || stats.recentClaims.length === 0) && (
                <div
                  className="text-center p-10 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">No recent verifications yet.</p>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* ════════════════════════════════ BOTTOM CTA ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden text-center py-20 px-8"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.25) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }} />

          <div className="relative z-10 space-y-5">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#a78bfa" }}>
              Ready to get started?
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Become a more informed citizen.
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Take the quiz, explore the world map, verify a claim — or just ask the AI anything.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/quiz">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                    color: "white",
                    boxShadow: "0 0 30px rgba(124,58,237,0.5)",
                  }}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Start Civic Quiz
                </motion.span>
              </Link>
              <Link href="/countries">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <Globe className="h-4 w-4" />
                  Explore Countries
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
