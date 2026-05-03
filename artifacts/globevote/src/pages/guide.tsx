import { useState } from "react";
import { useListElections, useListCountries } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ClipboardList, Megaphone, Vote, Calculator, Trophy, Building2,
  ChevronDown, ChevronRight, CheckCircle2, Circle, ArrowRight,
  Calendar, Users, Clock, BookOpen, MapPin, Info, Lightbulb,
  AlertCircle, Star
} from "lucide-react";

/* ─── Election phase data ─────────────────────────────────────────────── */
const PHASES = [
  {
    id: "pre-election",
    number: "01",
    icon: ClipboardList,
    title: "Pre-Election Period",
    subtitle: "Months before polling day",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.3)",
    gradient: "from-blue-500 to-blue-700",
    duration: "3–12 months before",
    steps: [
      { title: "Election Announced", desc: "The government or electoral authority officially announces the election date, triggering the formal campaign period." },
      { title: "Electoral Rolls Updated", desc: "Voter registration lists are verified and updated. Eligible citizens who haven't registered have their last chance to do so." },
      { title: "Candidate Nominations", desc: "Parties and independent candidates formally submit their candidacy paperwork, party manifestos, and required deposits." },
      { title: "Electoral Boundaries Confirmed", desc: "Constituency and district boundaries are finalised to determine which voters belong to which electoral district." },
    ],
    keyFact: "In most democracies, the election date is set by law or the head of government, and must be announced weeks to months in advance.",
    checklistTitle: "Voter Checklist",
    checklist: ["Check you are registered to vote", "Verify your registered address is current", "Understand your constituency or district", "Research your candidates and parties"],
  },
  {
    id: "campaign",
    number: "02",
    icon: Megaphone,
    title: "Campaign Period",
    subtitle: "Building public support",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.3)",
    gradient: "from-violet-500 to-purple-700",
    duration: "4–8 weeks before",
    steps: [
      { title: "Party Manifestos Released", desc: "Parties publish detailed policy platforms outlining what they would do if elected — from economic policy to healthcare to climate." },
      { title: "Debates & Rallies", desc: "Candidates debate publicly, hold rallies, and campaign door-to-door to persuade voters. Media coverage intensifies." },
      { title: "Campaign Spending Monitored", desc: "Electoral authorities track and limit campaign spending to prevent wealthy actors from dominating the process." },
      { title: "Polling & Analysis", desc: "Opinion polls track shifting voter preferences. Analysts model potential seat allocations under different scenarios." },
    ],
    keyFact: "Campaign finance laws vary enormously. The US has few limits; the UK caps spending per constituency. Germany bans political ads on TV entirely.",
    checklistTitle: "Smart Voter Actions",
    checklist: ["Watch at least one official debate", "Read party manifestos (or summaries)", "Check candidate backgrounds and track records", "Identify where you stand on key issues using a voter guide"],
  },
  {
    id: "voting",
    number: "03",
    icon: Vote,
    title: "Election Day",
    subtitle: "Your vote counts",
    color: "#34d399",
    glow: "rgba(52,211,153,0.3)",
    gradient: "from-emerald-500 to-teal-600",
    duration: "Polling day",
    steps: [
      { title: "Polls Open", desc: "Polling stations open, usually from early morning to evening. Some countries have multi-day voting or advance polls in prior weeks." },
      { title: "Voters Arrive & Verify Identity", desc: "Voters present required ID (rules vary by country), are checked against the electoral roll, and receive their ballot paper(s)." },
      { title: "Casting Your Ballot", desc: "Voters mark their ballot according to the system — one X for FPTP, numbered preferences for STV, two votes for MMP, etc." },
      { title: "Ballots Secured", desc: "Completed ballots are placed in sealed boxes under observation from party scrutineers and electoral officials." },
    ],
    keyFact: "In Australia, voting is compulsory — you face a fine for not voting. In the US, turnout often falls below 60%. Both are democracies.",
    checklistTitle: "On the Day",
    checklist: ["Bring required ID documents", "Know your polling station address", "Understand which ballot(s) you'll receive", "Arrive before polls close — queues inside still count"],
  },
  {
    id: "counting",
    number: "04",
    icon: Calculator,
    title: "Vote Counting",
    subtitle: "Translating ballots into results",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.3)",
    gradient: "from-amber-500 to-orange-600",
    duration: "Hours to days after",
    steps: [
      { title: "Ballot Boxes Opened", desc: "Under strict supervision, sealed boxes are opened and ballots sorted. Spoiled or invalid ballots are set aside and counted separately." },
      { title: "First-Count Results", desc: "Initial vote totals per candidate or party are recorded. For FPTP this is usually the end. For STV, multiple rounds of counting follow." },
      { title: "Transfers & Allocations", desc: "For PR and STV systems, votes transfer between candidates. Seat allocation formulas (D'Hondt, Sainte-Laguë) are applied." },
      { title: "Results Declared", desc: "Returning officers or electoral authorities formally declare winners in each constituency or at the national level." },
    ],
    keyFact: "The UK counts votes overnight — results come within hours. Some PR countries like Netherlands take days as coalition negotiations begin.",
    checklistTitle: "Understanding Results",
    checklist: ["Check your country's official electoral authority website", "Note the difference between vote share and seat share", "Watch for the 'swing' — how parties changed vs the last election", "Consider the Gallagher Index to assess proportionality"],
  },
  {
    id: "results",
    number: "05",
    icon: Trophy,
    title: "Results & Analysis",
    subtitle: "Who won and why",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.3)",
    gradient: "from-pink-500 to-rose-600",
    duration: "Days after polling",
    steps: [
      { title: "Official Results Published", desc: "The electoral authority certifies and publishes all vote totals, seat counts, and turnout figures. Legal challenges may begin." },
      { title: "Coalition Negotiations", desc: "In PR systems, parties often negotiate to form a majority coalition government. This can take days (Germany) or months (Belgium)." },
      { title: "Concession & Acceptance", desc: "Losing candidates and parties formally concede, and the winner is publicly acknowledged. This handover norm is vital to democracy." },
      { title: "Electoral Analysis", desc: "Political scientists and journalists analyse voter behaviour, demographic shifts, regional patterns, and what the result means." },
    ],
    keyFact: "Belgium holds the world record: 541 days without a government in 2010–11 after a hung election. Coalition politics is complex but stable.",
    checklistTitle: "Staying Informed",
    checklist: ["Read the official results from the electoral authority", "Compare results with pre-election polls", "Understand the difference: popular vote vs seat share", "Note any recounts or legal challenges filed"],
  },
  {
    id: "transition",
    number: "06",
    icon: Building2,
    title: "New Government",
    subtitle: "Power transferred peacefully",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.3)",
    gradient: "from-orange-500 to-red-500",
    duration: "Weeks after results",
    steps: [
      { title: "New Leaders Sworn In", desc: "The incoming Prime Minister, President, or governing coalition is formally sworn in, often in a ceremonial handover." },
      { title: "Parliament Convenes", desc: "The newly elected legislature meets for the first time. In parliamentary systems, the PM is elected by parliament." },
      { title: "Cabinet Appointed", desc: "Ministers are selected and portfolios assigned. In coalition governments each party negotiates their ministerial positions." },
      { title: "Programme Published", desc: "The government publishes its legislative programme — a formal statement of what it intends to do in its term in power." },
    ],
    keyFact: "The US has a fixed 'transition period' — 77 days between election and inauguration. The UK's changeover happens the very next morning.",
    checklistTitle: "Civic Engagement Continues",
    checklist: ["Contact your newly elected representative", "Track the government's programme against their promises", "Engage with consultations on legislation", "Prepare to vote again — local, regional, national"],
  },
];

/* ─── Voter journey steps ─────────────────────────────────────────────── */
const VOTER_JOURNEY = [
  { icon: BookOpen,     step: 1, title: "Get Informed",       desc: "Research candidates, read manifestos, and understand the key issues on the ballot. Use GlobeVote's AI Assistant." },
  { icon: ClipboardList,step: 2, title: "Register to Vote",   desc: "Check you're registered at your current address. Deadlines can be weeks before election day — don't miss them." },
  { icon: MapPin,       step: 3, title: "Find Your Station",  desc: "Look up your assigned polling station and plan how you'll get there. Check opening hours." },
  { icon: Info,         step: 4, title: "Check Your ID",      desc: "Know what ID is required in your country or state. Photo ID laws vary significantly by jurisdiction." },
  { icon: Vote,         step: 5, title: "Cast Your Vote",     desc: "Mark your ballot correctly for your system. Ask a polling officer if unsure — they cannot advise on who, only how." },
  { icon: Star,         step: 6, title: "Stay Engaged",       desc: "Track results, contact your representatives, and stay involved in civic life between elections." },
];

/* ─── Key terms ───────────────────────────────────────────────────────── */
const TERMS = [
  { term: "Electoral Roll",   def: "The official list of eligible voters. You must be registered on it to vote." },
  { term: "Constituency",     def: "A geographic area that elects one or more representatives to a legislature." },
  { term: "Manifesto",        def: "A party's published statement of its policies and plans if elected." },
  { term: "Returning Officer",def: "The official responsible for running an election in a constituency and declaring the result." },
  { term: "Spoiled Ballot",   def: "A ballot that is unclear or incorrectly marked — it is counted but doesn't go to any candidate." },
  { term: "Swing",            def: "The change in vote share between two elections, showing how voter support shifted." },
  { term: "First Past the Post", def: "The candidate with the most votes wins, regardless of whether they have a majority." },
  { term: "Coalition Government", def: "A government formed by two or more parties who together hold a majority of seats." },
  { term: "Voter Turnout",    def: "The percentage of eligible voters who actually cast a ballot." },
  { term: "Constituency Boundary", def: "The geographic lines that define which voters belong to which constituency." },
  { term: "Proportional Representation", def: "An electoral system where parties' seat shares closely match their vote shares." },
  { term: "Electoral Threshold", def: "A minimum vote share a party must reach to win seats — e.g. Germany's 5% rule." },
];

/* ─── Sub-components ──────────────────────────────────────────────────── */
function PhaseCard({ phase, index }: { phase: typeof PHASES[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const Icon = phase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left group"
        onClick={() => setOpen((o) => !o)}
        data-testid={`phase-toggle-${phase.id}`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${phase.gradient}`}
          style={{ boxShadow: `0 4px 20px ${phase.glow}` }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest" style={{ color: phase.color }}>
              PHASE {phase.number}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${phase.color}18`, color: phase.color }}>
              {phase.duration}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{phase.title}</h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{phase.subtitle}</p>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)" }}>
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 grid lg:grid-cols-3 gap-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>

              {/* Steps */}
              <div className="lg:col-span-2 pt-5 space-y-3">
                {phase.steps.map((s, si) => (
                  <motion.button
                    key={si}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={{
                      background: activeStep === si ? `${phase.color}14` : "rgba(255,255,255,0.03)",
                      border: activeStep === si ? `1px solid ${phase.color}44` : "1px solid rgba(255,255,255,0.06)",
                    }}
                    onClick={() => setActiveStep(activeStep === si ? null : si)}
                    whileHover={{ x: 4 }}
                    data-testid={`step-${phase.id}-${si}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background: `${phase.color}22`, color: phase.color }}
                      >
                        {si + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-white">{s.title}</p>
                        <AnimatePresence>
                          {activeStep === si && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm mt-1.5 leading-relaxed overflow-hidden"
                              style={{ color: "rgba(255,255,255,0.55)" }}
                            >
                              {s.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronDown
                        className="h-4 w-4 shrink-0 mt-0.5 transition-transform"
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          transform: activeStep === si ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </motion.button>
                ))}

                {/* Key fact */}
                <div
                  className="flex gap-3 p-4 rounded-xl mt-2"
                  style={{ background: `${phase.color}0e`, border: `1px solid ${phase.color}28` }}
                >
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" style={{ color: phase.color }} />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <span className="font-semibold" style={{ color: phase.color }}>Did you know? </span>
                    {phase.keyFact}
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="pt-5">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {phase.checklistTitle}
                </p>
                <div className="space-y-2.5">
                  {phase.checklist.map((item, ci) => (
                    <ChecklistItem key={ci} text={item} color={phase.color} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChecklistItem({ text, color }: { text: string; color: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      className="w-full flex items-start gap-2.5 text-left group"
      onClick={() => setChecked((c) => !c)}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
        style={{
          background: checked ? color : "rgba(255,255,255,0.08)",
          border: checked ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
      </div>
      <p
        className="text-sm transition-all"
        style={{
          color: checked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.65)",
          textDecoration: checked ? "line-through" : "none",
        }}
      >
        {text}
      </p>
    </button>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function Guide() {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  const { data: elections } = useListElections({ status: "upcoming", limit: 6 });

  function getDaysUntil(dateStr: string) {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  }

  const DARK = "rgba(255,255,255,0.04)";
  const BORDER = "rgba(255,255,255,0.08)";
  const MUTED = "rgba(255,255,255,0.45)";
  const WHITE = "rgba(255,255,255,0.85)";

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "linear-gradient(135deg, #05070f 0%, #090d1a 50%, #07111f 100%)" }}
    >
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ left: "5%", top: "10%", width: 500, height: 500, background: "rgba(29,78,216,0.15)", filter: "blur(90px)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ right: "5%", bottom: "15%", width: 400, height: 400, background: "rgba(124,58,237,0.12)", filter: "blur(80px)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 space-y-20">

        {/* ── Hero ── */}
        <motion.div
          className="text-center space-y-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#93c5fd" }}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Election Education
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
            How Elections{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Actually Work
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            From the moment an election is called to the swearing in of a new government —
            every phase, every step, explained clearly and interactively.
          </p>
          {/* Phase pill nav */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {PHASES.map((p) => (
              <a
                key={p.id}
                href={`#phase-${p.id}`}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
              >
                {p.number} {p.title.split(" ")[0]}
              </a>
            ))}
          </div>
        </motion.div>

        {/* ── Phase timeline ── */}
        <section id="phases" className="space-y-4">
          <motion.h2
            className="text-2xl font-black text-white mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The 6 Phases of an Election
          </motion.h2>

          {/* Visual progress bar */}
          <div className="relative flex items-center gap-0 mb-8 overflow-x-auto pb-2">
            {PHASES.map((p, i) => (
              <div key={p.id} className="flex items-center flex-shrink-0">
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => document.getElementById(`phase-${p.id}`)?.scrollIntoView({ behavior: "smooth" })}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${p.color}cc, ${p.color}88)`, boxShadow: `0 0 16px ${p.glow}` }}
                  >
                    {p.number}
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap" style={{ color: p.color }}>
                    {p.title.split(" ")[0]}
                  </span>
                </div>
                {i < PHASES.length - 1 && (
                  <div className="w-10 sm:w-16 h-0.5 mx-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${p.color}60, ${PHASES[i+1].color}60)` }} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {PHASES.map((phase, i) => (
              <div key={phase.id} id={`phase-${phase.id}`}>
                <PhaseCard phase={phase} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Voter journey ── */}
        <section>
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white mb-2">Your Voter Journey</h2>
            <p style={{ color: MUTED }} className="text-base">
              Six steps every citizen should take before, during, and after an election.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div
              className="absolute left-6 top-6 bottom-6 w-0.5 hidden sm:block"
              style={{ background: "linear-gradient(180deg, #60a5fa, #a78bfa, #f472b6, #34d399, #fbbf24, #fb923c)" }}
            />

            <div className="space-y-4">
              {VOTER_JOURNEY.map((step, i) => {
                const Icon = step.icon;
                const colors = ["#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#fb923c"];
                const color = colors[i];
                const isActive = journeyStep === i;
                return (
                  <motion.button
                    key={i}
                    className="w-full text-left flex items-start gap-5 sm:pl-16 relative"
                    onClick={() => setJourneyStep(isActive ? -1 : i)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    data-testid={`journey-step-${i}`}
                  >
                    {/* Node on line */}
                    <div
                      className="absolute left-3.5 sm:left-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center hidden sm:flex shrink-0"
                      style={{
                        background: isActive ? color : "#090d1a",
                        borderColor: color,
                        top: "14px",
                        boxShadow: isActive ? `0 0 12px ${color}` : "none",
                      }}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    <div
                      className="flex-1 rounded-2xl p-5 transition-all"
                      style={{
                        background: isActive ? `${color}0f` : DARK,
                        border: `1px solid ${isActive ? `${color}40` : BORDER}`,
                        boxShadow: isActive ? `0 0 24px ${color}20` : "none",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <span className="text-xs font-bold tracking-widest" style={{ color }}>STEP {step.step}</span>
                          <h3 className="font-bold text-white text-base leading-tight">{step.title}</h3>
                        </div>
                        <ChevronDown
                          className="h-4 w-4 ml-auto transition-transform"
                          style={{ color: "rgba(255,255,255,0.3)", transform: isActive ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm leading-relaxed mt-2 overflow-hidden"
                            style={{ color: MUTED }}
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Upcoming elections timeline ── */}
        {elections && elections.length > 0 && (
          <section>
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-white mb-2">Upcoming Elections Timeline</h2>
              <p style={{ color: MUTED }} className="text-base">Real elections happening around the world.</p>
            </motion.div>

            <div className="space-y-3">
              {elections.map((election, i) => {
                const days = getDaysUntil(election.date);
                const urgency = days < 60 ? "#f472b6" : days < 180 ? "#fbbf24" : "#60a5fa";
                const pct = Math.max(4, Math.min(96, 100 - (days / 730) * 100));
                return (
                  <motion.div
                    key={election.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link href={`/elections/${election.id}`}>
                      <div
                        className="p-5 rounded-2xl cursor-pointer group hover:scale-[1.01] transition-transform"
                        style={{ background: DARK, border: `1px solid ${BORDER}` }}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-3xl shrink-0">{election.countryFlag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white group-hover:text-blue-300 transition-colors truncate">{election.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                              {new Date(election.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                              {" · "}{election.type.charAt(0).toUpperCase() + election.type.slice(1)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-black" style={{ color: urgency }}>{days}</div>
                            <div className="text-xs" style={{ color: MUTED }}>days away</div>
                          </div>
                        </div>
                        {/* Progress to election */}
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${urgency}88, ${urgency})` }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <span>Today</span>
                          <span>Election Day</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Glossary ── */}
        <section>
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white mb-2">Key Election Terms</h2>
            <p style={{ color: MUTED }}>Click any term to reveal its definition.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TERMS.map((t, i) => (
              <motion.button
                key={t.term}
                className="text-left rounded-xl p-4 transition-all"
                onClick={() => setOpenTerm(openTerm === t.term ? null : t.term)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: openTerm === t.term ? "rgba(96,165,250,0.1)" : DARK,
                  border: `1px solid ${openTerm === t.term ? "rgba(96,165,250,0.35)" : BORDER}`,
                }}
                data-testid={`term-${i}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm" style={{ color: openTerm === t.term ? "#60a5fa" : WHITE }}>
                    {t.term}
                  </p>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform"
                    style={{ color: "rgba(255,255,255,0.3)", transform: openTerm === t.term ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </div>
                <AnimatePresence>
                  {openTerm === t.term && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs leading-relaxed mt-2 overflow-hidden"
                      style={{ color: MUTED }}
                    >
                      {t.def}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl py-16 px-8 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 70%)" }} />
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-black text-white">Ready to dig deeper?</h2>
            <p style={{ color: MUTED }} className="max-w-lg mx-auto">Explore country-specific election processes, take the civic quiz, or ask our AI anything about how democracy works.</p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link href="/countries">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
                  <Globe className="h-4 w-4" /> Explore Countries
                </motion.span>
              </Link>
              <Link href="/quiz">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                  Test Your Knowledge <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
