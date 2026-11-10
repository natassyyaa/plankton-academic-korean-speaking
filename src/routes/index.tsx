import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  GraduationCap,
  MessagesSquare,
  Presentation,
  Sparkles,
  Target,
  Upload,
  Mic,
  FileBarChart,
  HelpCircle,
  BookOpen,
  Clock,
} from "lucide-react";
import heroOcean from "@/assets/hero-ocean.jpg";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { pricingPlans } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLANKTON — From Understanding Korean to Speaking It Confidently" },
      {
        name: "description",
        content:
          "AI-powered academic Korean speaking practice for international students: seminar discussions, presentation rehearsal, professor Q&A and personalised feedback.",
      },
      { property: "og:title", content: "PLANKTON — Speak academic Korean with confidence" },
      {
        property: "og:description",
        content: "Practise seminar discussions, presentations and professor Q&A in Korean, built for international students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const problems = [
  { icon: BookOpen, title: "You understand lectures…", text: "…but freeze when it's your turn to speak in a seminar." },
  { icon: Presentation, title: "Presentations feel risky", text: "Academic Korean expressions and formal endings are hard to rehearse alone." },
  { icon: HelpCircle, title: "Professor questions are unpredictable", text: "There's little chance to practise follow-up questions before the real thing." },
];

const features = [
  {
    icon: MessagesSquare,
    title: "Academic Speaking",
    ko: "학술 말하기",
    text: "Role-play classroom discussions, group projects and office-hour conversations with an AI professor or classmate.",
  },
  {
    icon: Presentation,
    title: "Presentation Simulator",
    ko: "발표 시뮬레이터",
    text: "Upload your script and slides, rehearse against a timer, and get ready for the real presentation.",
  },
  {
    icon: GraduationCap,
    title: "Professor Q&A",
    ko: "교수님 질의응답",
    text: "Face realistic follow-up questions at the difficulty level you choose — from basic to thesis-defence.",
  },
  {
    icon: FileBarChart,
    title: "Personalised Feedback",
    ko: "맞춤형 피드백",
    text: "See grammar, vocabulary, fluency, pronunciation and academic expression feedback with concrete rewrites.",
  },
];

const steps = [
  { icon: Target, title: "Set your goal", text: "Choose your level, major and what you need to practise this week." },
  { icon: Upload, title: "Bring your material", text: "Pick a scenario or upload your own script, slides and topic." },
  { icon: Mic, title: "Speak in Korean", text: "Talk with an AI professor or classmate, by voice or text." },
  { icon: BarChart3, title: "Review & improve", text: "Get a feedback report and track progress over the semester." },
];

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
          <Link to="/" aria-label="PLANKTON home">
            <Logo inverted />
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm font-medium text-navy-foreground/80 md:flex">
            <a href="#features" className="hover:text-navy-foreground">Features</a>
            <a href="#how" className="hover:text-navy-foreground">How it works</a>
            <a href="#pricing" className="hover:text-navy-foreground">Pricing</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher className="hidden border-navy-foreground/20 sm:flex" />
            <Button asChild className="rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
              <Link to="/dashboard">{t("common.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <img
          src={heroOcean}
          alt=""
          width={1536}
          height={1152}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-32 pt-32 md:px-8 md:pb-40 md:pt-40 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5 text-teal" /> For international students at Korean universities
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.08] md:text-6xl">
              From Understanding Korean to{" "}
              <span className="text-gradient-ocean">Speaking It Confidently.</span>
            </h1>
            <p className="max-w-xl text-base text-navy-foreground/80 md:text-lg">
              PLANKTON is your academic Korean speaking partner — practise seminar discussions,
              rehearse presentations and prepare for professor questions before they happen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-teal px-7 text-base text-teal-foreground shadow-glow hover:bg-teal/90">
                <Link to="/dashboard">
                  {t("common.getStarted")} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-navy-foreground/30 bg-transparent px-7 text-base text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
                <a href="#features">Explore features</a>
              </Button>
            </div>
          </div>

          {/* Floating preview card */}
          <div className="relative hidden lg:block">
            <div className="animate-float rounded-3xl border border-navy-foreground/15 bg-card/95 p-5 text-card-foreground shadow-elegant backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-ocean text-navy-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Professor Q&A</p>
                    <p className="text-xs text-muted-foreground">Example conversation</p>
                  </div>
                </div>
                <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold uppercase text-warning-foreground">Illustration</span>
              </div>
              <div className="space-y-3 font-kr text-sm">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5">
                  연구 방법을 선택한 근거를 설명해 주시겠어요?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                  네, 결론부터 말씀드리면 설문 조사가 가장 적합하다고 판단했습니다.
                </div>
                <div className="rounded-xl border border-dashed border-teal/50 bg-accent/60 px-3 py-2 font-sans text-xs text-accent-foreground">
                  💡 Great structure — you stated the conclusion first.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">The challenge</p>
            <h2 className="text-3xl font-bold md:text-4xl">Passing TOPIK isn't the same as speaking up in class.</h2>
            <p className="text-muted-foreground">
              Many international students read and listen well, but academic speaking — discussions,
              presentations, polite requests to professors — needs practice that's hard to find on campus.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {problems.map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-5 shadow-soft">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-sky text-sky-foreground">
                  <p.icon className="size-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 bg-tide py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Features</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Everything you need to speak in academic settings</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border p-7 shadow-soft transition-shadow hover:shadow-elegant",
                  i === 0 ? "bg-ocean text-navy-foreground" : "bg-card",
                )}
              >
                <div
                  className={cn(
                    "mb-6 flex size-12 items-center justify-center rounded-2xl",
                    i === 0 ? "bg-navy-foreground/15" : "bg-accent text-accent-foreground",
                  )}
                >
                  <f.icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold">
                  {f.title}
                  <span className={cn("ml-2 font-kr text-sm font-medium", i === 0 ? "text-navy-foreground/70" : "text-muted-foreground")}>
                    {f.ko}
                  </span>
                </h3>
                <p className={cn("mt-2 max-w-md", i === 0 ? "text-navy-foreground/80" : "text-muted-foreground")}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-20 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">How it works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Four steps, every week</h2>
        </div>
        <ol className="grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border bg-card p-6 shadow-soft">
              <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-sky">0{i + 1}</span>
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="size-5" />
              </div>
              <h3 className="mb-1.5 font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-16 bg-tide py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Pricing preview</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Simple plans for students and universities</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Indicative pricing for this preview — final plans haven't been set and no payment is taken.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-3xl border p-7 shadow-soft",
                  plan.highlighted ? "bg-navy text-navy-foreground shadow-elegant md:-translate-y-3" : "bg-card",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-teal px-2.5 py-0.5 text-xs font-semibold text-teal-foreground">Popular</span>
                  )}
                </div>
                <p className={cn("mt-1 text-sm", plan.highlighted ? "text-navy-foreground/70" : "text-muted-foreground")}>
                  {plan.description}
                </p>
                <p className="mt-6 font-display text-4xl font-extrabold">
                  {plan.price}
                  <span className={cn("ml-1.5 font-sans text-sm font-medium", plan.highlighted ? "text-navy-foreground/70" : "text-muted-foreground")}>
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn(
                    "mt-7 h-11 rounded-full",
                    plan.highlighted ? "bg-teal text-teal-foreground hover:bg-teal/90" : "",
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link to="/dashboard">Explore the preview</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ocean px-6 py-14 text-center text-navy-foreground shadow-elegant md:px-16">
          <p className="font-kr text-lg text-navy-foreground/80">자신 있게 말해 보세요.</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold md:text-4xl">
            Your next seminar, presentation and Q&A — practised before it happens.
          </h2>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full bg-card px-8 text-base text-foreground hover:bg-card/90">
            <Link to="/dashboard">
              {t("common.getStarted")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <Logo />
          <p className="flex items-center gap-1.5">
            <Clock className="size-4" /> Early design preview · © 2026 PLANKTON
          </p>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
