import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, BookOpen, Zap, Trophy, Search, ChevronDown, BarChart2, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import logoBlack from "@/assets/logo-black.png";
import logoWhite from "@/assets/logo-white.png";
import stickImg from "@/assets/stick.png";
import clubSlavia from "@/assets/clubs/slavia.png";
import clubBohemians from "@/assets/clubs/bohemians.png";
import clubHostivar from "@/assets/clubs/hostivar.png";
import clubMnichovice from "@/assets/clubs/mnichovice.png";
import clubPraga from "@/assets/clubs/praga.png";
import clubHclogo from "@/assets/clubs/hclogo.png";
import clubRakovnik from "@/assets/clubs/rakovnik.png";
import clubPresident from "@/assets/clubs/president.png";
import clubKbely from "@/assets/clubs/kbely.png";
import clubPlzen from "@/assets/clubs/plzen.png";

// ── Clubs ────────────────────────────────────────────────────────────────────
const clubs = [
  { name: "SK Slavia Praha", url: clubSlavia },
  { name: "HC Bohemians", url: clubBohemians },
  { name: "HC Hostivař", url: clubHostivar },
  { name: "TJ Mnichovice", url: clubMnichovice },
  { name: "HC 1946 Praga", url: clubPraga },
  { name: "HC Logo", url: clubHclogo },
  { name: "Rakovník", url: clubRakovnik },
  { name: "President", url: clubPresident },
  { name: "TJ Sokol Kbely", url: clubKbely },
];

// ── Ticker data ───────────────────────────────────────────────────────────────
const tickerItems = [
  { text: "PENALTY CORNER", icon: true },
  { text: "DRAG FLICK", icon: false },
  { text: "PRESS DEFENSE", icon: false },
  { text: "CIRCLE ENTRY", icon: true },
  { text: "REVERSE STICK", icon: false },
  { text: "OVERLOAD DRILL", icon: false },
  { text: "SHORT CORNER", icon: true },
  { text: "AERIAL BALL", icon: false },
  { text: "HIGH PRESS", icon: false },
  { text: "3v2 ATTACK", icon: true },
  { text: "ZONE DEFENSE", icon: false },
  { text: "DRAG BACK", icon: false },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "500+", label: "Drills Created", mono: true },
  { value: "120+", label: "Active Coaches", mono: true },
  { value: "10+", label: "Categories", mono: true },
  { value: "100%", label: "Free to Start", mono: true },
];

// ── Features ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Sparkles,
    tag: "AI-POWERED",
    title: "Diagram Generation",
    description: "Upload a photo of your hand-drawn drill and watch AI transform it into a professional, branded field hockey diagram in seconds.",
    accent: "from-[#F68D06] to-[#F6824D]",
  },
  {
    icon: BookOpen,
    tag: "ORGANIZE",
    title: "Personal Library",
    description: "Store, tag, and organize all your drills and session plans. Find exactly what you need in seconds with smart filtering.",
    accent: "from-[#C0C6E8] to-[#8B96D4]",
  },
  {
    icon: Users,
    tag: "COMMUNITY",
    title: "Global Network",
    description: "Connect with field hockey coaches worldwide. Share drills, comment, follow coaches, and grow your coaching practice together.",
    accent: "from-[#272B35] to-[#3D4557]",
  },
  {
    icon: Zap,
    tag: "CREATE",
    title: "Smart Builder",
    description: "Build complete training sessions from your drill library. Drag, reorder, and time your sessions with an intuitive interface.",
    accent: "from-[#F6824D] to-[#F68D06]",
  },
  {
    icon: Search,
    tag: "DISCOVER",
    title: "Intelligent Search",
    description: "Find drills by category, age group, difficulty, and field hockey position. Discover what top coaches are creating.",
    accent: "from-[#8B96D4] to-[#C0C6E8]",
  },
  {
    icon: Trophy,
    tag: "GROW",
    title: "Coaching Portfolio",
    description: "Build your public coaching profile. Showcase your drills, track engagement, and establish yourself in the community.",
    accent: "from-[#3D4557] to-[#272B35]",
  },
];


// ── Pitch Lines (abstract field hockey pitch top-down) ────────────────────────
const PitchLines = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 400 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer boundary */}
    <rect x="2" y="2" width="396" height="236" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
    {/* Center line */}
    <line x1="200" y1="2" x2="200" y2="238" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
    {/* Center circle */}
    <circle cx="200" cy="120" r="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
    {/* Shooting circle left */}
    <path d="M2 70 Q90 120 2 170" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
    {/* Shooting circle right */}
    <path d="M398 70 Q310 120 398 170" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
    {/* 23m lines */}
    <line x1="100" y1="2" x2="100" y2="238" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.2" />
    <line x1="300" y1="2" x2="300" y2="238" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.2" />
    {/* Goals */}
    <rect x="2" y="95" width="12" height="50" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    <rect x="386" y="95" width="12" height="50" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* Ball dot */}
    <circle cx="200" cy="120" r="5" fill="#F68D06" />
    {/* Player dots */}
    {[
      [140, 80], [160, 130], [140, 180],
      [260, 80], [240, 130], [260, 180],
      [80, 120], [320, 120],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="6" fill={i < 3 ? "#F68D06" : "#C0C6E8"} fillOpacity="0.8" />
    ))}
  </svg>
);

// ── Animated counter ──────────────────────────────────────────────────────────
const AnimatedStat = ({ value, label }: { value: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="font-mono text-4xl md:text-5xl font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
};


// ── Parallax floating card ────────────────────────────────────────────────────
const ParallaxCard = ({
  children, depth, className, style, initialX, initialY,
}: {
  children: React.ReactNode;
  depth: number;
  className?: string;
  style?: React.CSSProperties;
  initialX: string;
  initialY: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set(((e.clientX - cx) / cx) * depth * 18);
      y.set(((e.clientY - cy) / cy) * depth * 12);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [depth]);

  return (
    <motion.div
      className={`absolute select-none ${style?.pointerEvents === "auto" ? "" : "pointer-events-none"} ${className ?? ""}`}
      style={{ left: initialX, top: initialY, x: springX, y: springY, ...style }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Index = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  useEffect(() => setMounted(true), []);

  const logo = mounted && resolvedTheme === "dark" ? logoWhite : logoBlack;
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="nav-blur fixed top-0 w-full z-50 border-b border-border/40 transition-all duration-300"
        style={{ background: isDark ? "rgba(0,0,0,0.7)" : "rgba(245,246,246,0.8)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logo} alt="Drilzz" className="h-8" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 shadow-none">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-16 pb-8" style={{ minHeight: "calc(85vh + 10px)", background: isDark ? "linear-gradient(160deg, #0d0b09 0%, #1a1410 50%, #0d0b09 100%)" : "linear-gradient(160deg, #faf8f5 0%, #f5ede4 45%, #faf8f5 100%)" }}>

        {/* Radial glow top-center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none select-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,116,67,0.18) 0%, transparent 65%)" }} />
        {/* Radial glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] pointer-events-none select-none"
          style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(240,116,67,0.07) 0%, transparent 70%)" }} />

        {/* Large stick — right side decorative */}
        <motion.img
          src={stickImg}
          alt=""
          aria-hidden
          className="absolute hidden lg:block pointer-events-none select-none"
          style={{ right: "-8%", top: "calc(5% + 90px)", width: "560px", opacity: 1, rotate: "8deg" }}
          animate={{ y: [0, -14, 0], rotate: ["8deg", "6deg", "8deg"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Interactive parallax floating cards ── */}


        {/* Top-right: Drills stat */}
        <ParallaxCard depth={1.2} initialX="calc(50% + 340px)" initialY="15%">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl border border-border bg-card shadow-soft px-4 py-3 min-w-[130px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Drills created</span>
            </div>
            <div className="font-mono text-2xl font-semibold text-foreground">500+</div>
            <div className="mt-2 h-[3px] rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
          </motion.div>
        </ParallaxCard>

        {/* Top-left: AI badge */}
        <ParallaxCard depth={0.8} initialX="calc(50% - 500px)" initialY="17%">
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="rounded-xl border border-border bg-card shadow-soft px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">AI Diagrams</div>
              <div className="text-[11px] text-muted-foreground">From sketch to pro</div>
            </div>
          </motion.div>
        </ParallaxCard>

        {/* Left: coaches */}
        <ParallaxCard depth={1.5} initialX="calc(50% - 530px)" initialY="40%" className="hidden lg:block">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="rounded-xl border border-border bg-card shadow-soft px-4 py-3"
          >
            <div className="flex items-center mb-2">
              {[
                "https://columns.wlu.edu/wp-content/uploads/2022/12/10675-scaled.jpg",
                "https://images.sidearmdev.com/resize?url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fohiostatebuckeyes.com%2Fimages%2F2024%2F1%2F5%2Ffh_0903_112.jpg&height=300&type=webp",
                "https://coachercompany.com/wp-content/uploads/2022/11/Coacher23_FieldHockey_Coach-scaled.jpg",
              ].map((src, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-card overflow-hidden flex-shrink-0" style={{ marginLeft: i > 0 ? "-8px" : "0" }}>
                  <img src={src} alt="Coach" className="w-full h-full object-cover object-top" />
                </div>
              ))}
              <span className="text-xs font-medium text-foreground ml-2">+120</span>
            </div>
            <div className="text-[11px] text-muted-foreground">Active coaches</div>
          </motion.div>
        </ParallaxCard>

        {/* Right: pitch mini */}
        <ParallaxCard depth={1.0} initialX="calc(50% + 390px)" initialY="calc(30% + 35px)" className="hidden lg:block">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="rounded-xl border border-border bg-card shadow-soft p-3 w-[140px]"
          >
            <PitchLines className="w-full text-foreground/40" />
            <div className="text-[10px] text-muted-foreground text-center mt-1.5 tracking-widest uppercase font-mono">Pitch view</div>
          </motion.div>
        </ParallaxCard>

        {/* Bottom-left: session card */}
        <ParallaxCard depth={0.6} initialX="calc(50% - 510px)" initialY="62%" className="hidden lg:block">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="rounded-xl border border-border bg-card shadow-soft px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Layers className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Session Builder</div>
              <div className="text-[11px] text-muted-foreground">Plan full trainings</div>
            </div>
          </motion.div>
        </ParallaxCard>


        {/* ── Center content ── */}
        <div className="relative z-10 text-center max-w-xl mx-auto px-6">

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-7"
          >
            <i className="fi fi-sc-field-hockey text-sm leading-none" style={{ background: "linear-gradient(90deg, #f07443, #f5a623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} />
            Field Hockey Coaching Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(32px,4.5vw,62px)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground"
          >
            Coach smarter.{" "}
            <span style={{ background: "linear-gradient(90deg, #f07443 0%, #f5a623 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Play better.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="mt-5 text-[14px] text-muted-foreground max-w-sm mx-auto leading-[1.7]"
          >
            Create professional drill diagrams, build your library, and connect with field hockey coaches worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.48 }}
            className="mt-7 flex items-center justify-center gap-3"
          >
            <Link to="/register">
              <Button size="lg" className="rounded-full h-10 px-7 text-sm shadow-[0_4px_14px_rgba(240,116,67,0.30)] hover:shadow-[0_6px_18px_rgba(240,116,67,0.38)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Start for free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/field-hockey">
              <Button variant="ghost" size="lg" className="rounded-full h-10 px-5 text-sm text-muted-foreground hover:text-foreground">
                Explore drills
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-0 divide-x divide-border"
          >
            {stats.map((s, i) => (
              <div key={i} className="px-6 text-center first:pl-0 last:pr-0">
                <div className="font-mono text-lg font-semibold" style={{ background: "linear-gradient(90deg, #f07443 0%, #f5a623 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-muted-foreground/40"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <div className="border-y border-border overflow-hidden py-3.5 bg-muted/20">
        <div className="animate-ticker flex gap-10 whitespace-nowrap items-center">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-3">
              {item.icon
                ? <i className="fi fi-sc-field-hockey text-primary leading-none" style={{ fontSize: "13px" }} />
                : <span className="w-1 h-1 rounded-full bg-border inline-block" />
              }
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Photo Section ───────────────────────────────────────────────── */}
      <section className="pb-24 md:pb-32 pt-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src="https://res.cloudinary.com/usopc-prod/image/upload/v1712948781/NGB%20Field%20Hockey/Coach%20Ed/2024%20Workshop/Photo_Oct_05_2023_5_21_36_AM.jpg"
                alt="Field hockey coaching"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(240,116,67,0.12) 0%, transparent 60%)" }} />
            </div>

            {/* Floating stat badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-6 -right-6 rounded-2xl border border-border bg-card shadow-medium px-5 py-4"
            >
              <div className="font-mono text-3xl font-bold text-foreground">500+</div>
              <div className="text-xs text-muted-foreground mt-0.5">drills created by coaches</div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:pl-8"
          >
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">For coaches, by coaches</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-[1.05] mt-4 mb-6">
              Everything you need to run better trainings
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: "Sketch it, then let AI handle the rest",
                  body: "Draw your drill on paper, take a photo, and our AI converts it into a clean, professional diagram — ready to share with your team.",
                },
                {
                  title: "Build sessions in minutes",
                  body: "Pull drills from your personal library, sequence them into a full training session, and add timing and notes — all in one place.",
                },
                {
                  title: "Learn from the global community",
                  body: "Browse thousands of drills shared by field hockey coaches worldwide. Filter by age group, skill level, and position.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{item.body}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-10"
            >
              <Link to="/register">
                <Button className="rounded-full h-11 px-7 text-sm shadow-[0_4px_14px_rgba(240,116,67,0.28)] hover:shadow-[0_6px_18px_rgba(240,116,67,0.36)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Start coaching smarter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── Clubs Section ───────────────────────────────────────────────── */}
      <section className="pb-20 pt-4 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Trusted by
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mt-2">
              Clubs already using Drilzz
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clubs.map((club, i) => (
              <motion.img
                key={i}
                src={club.url}
                alt={club.name}
                title={club.name}
                loading="lazy"
                className="h-14 md:h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 0.8, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">Platform</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-[1.05] mt-3 max-w-xl">
              Everything a coach needs
            </h2>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="card-hover group relative rounded-2xl border border-border/60 bg-card p-8 overflow-hidden"
                >
                  {/* Subtle gradient top */}
                  <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${f.accent} opacity-60`} />

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${f.accent} mb-6`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Tag */}
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {f.tag}
                  </span>

                  <h3 className="text-xl font-semibold tracking-tight mt-2 mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pitch Visual Section ─────────────────────────────────────────── */}
      <section className="py-24 px-6 overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #0a0c10 0%, #272B35 100%)"
            : "linear-gradient(160deg, #272B35 0%, #1a1d24 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">AI Diagrams</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-[1.05] mt-3 text-white">
              Professional diagrams,<br />instantly.
            </h2>
            <p className="mt-5 text-white/60 text-base leading-relaxed max-w-md">
              From a rough sketch to a fully branded, professional field hockey drill diagram in seconds. Our AI understands the sport.
            </p>
            <Link to="/register">
              <Button className="mt-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 shadow-[0_8px_24px_rgba(246,141,6,0.25)] hover:scale-[1.02] transition-all">
                Try AI Generation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl opacity-20"
              style={{ background: "radial-gradient(circle at 50% 50%, #F68D06, transparent 70%)" }} />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <PitchLines className="w-full text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
            style={{
              background: "linear-gradient(135deg, #272B35 0%, #1a1d24 100%)",
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(246,141,6,0.15) 0%, transparent 60%)" }} />


            <div className="relative z-10">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">Get Started</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-[1.05] mt-4 text-white max-w-2xl mx-auto">
                Elevate your field hockey coaching
              </h2>
              <p className="mt-5 text-white/60 text-base max-w-lg mx-auto">
                Join coaches building their professional coaching practice on Drilzz. Free to start, no credit card required.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base font-semibold shadow-[0_8px_24px_rgba(246,141,6,0.3)] hover:shadow-[0_12px_32px_rgba(246,141,6,0.4)] hover:scale-[1.02] transition-all">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-base border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card mt-4">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src={logo} alt="Drilzz" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                The professional platform for field hockey coaches to create, share, and discover coaching drills.
              </p>
            </div>
            {/* Links */}
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">Platform</p>
              <div className="flex flex-col gap-2.5">
                {[["Explore Drills", "/field-hockey"], ["Create Drill", "/register"], ["Community", "/register"], ["Session Builder", "/register"]].map(([label, href]) => (
                  <Link key={label} to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">Company</p>
              <div className="flex flex-col gap-2.5">
                {[["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Cookie Policy", "/cookies"]].map(([label, href]) => (
                  <Link key={label} to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[12px] font-mono text-muted-foreground/60 uppercase tracking-[0.12em]">
              Field Hockey Coaching Platform
            </span>
            <span className="text-[12px] text-muted-foreground/50">
              © {new Date().getFullYear()} Drilzz. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
