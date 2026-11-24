import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Download, Mail, MessageCircle, Phone, RotateCw } from "lucide-react";
import { content, contact, type Lang, type Project } from "@/content";
import DiskPanel from "@/components/DiskPanel";
import { DealIn, Reveal, TurnIn, useInView } from "@/components/Anim";
import SplitFlapText from "@/components/kokonutui/split-flap-text";
import CardFlip from "@/components/kokonutui/card-flip";
import ReceiptPrinter from "@/components/kokonutui/receipt-printer";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("av-lang");
    if (saved === "it" || saved === "en") return saved;
  } catch {
    /* storage blocked: fall back to the browser language */
  }
  return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
}

const btnPrimary =
  "inline-flex h-12 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-deep shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] transition-[background-color,transform] duration-150 ease-out-soft hover:bg-white active:scale-[0.98]";
const btnSecondary =
  "inline-flex h-12 items-center gap-2 rounded-[10px] border hairline bg-raised px-5 text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-[background-color,transform] duration-150 ease-out-soft hover:bg-[#2e2b27] active:scale-[0.98]";

function Status({ label, live }: { label: string; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-2">
      <span className={`size-1.5 rounded-full ${live ? "bg-ok" : "bg-ink-3"}`} />
      {label}
    </span>
  );
}

function SectionHead({ id, title, sub }: { id?: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <h2 className="text-[36px] font-medium leading-[1.15] tracking-[-0.02em]" id={id}>
        {title}
      </h2>
      {sub && <p className="mt-3 text-[17px] leading-7 text-ink-2">{sub}</p>}
    </Reveal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div className="py-8" ref={ref}>
      <SplitFlapText
        className="text-[26px] font-medium sm:text-[30px]"
        length={value.length}
        text={seen ? value : value.replace(/[^ ]/g, "0")}
        tileClassName="bg-raised text-ink"
      />
      <p className="mt-4 max-w-[16rem] text-sm leading-5 text-ink-2">{label}</p>
    </div>
  );
}

function Facts({ items }: { items: string[][] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t hairline pt-6 sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={v}>
          <dt className="font-mono text-[15px] text-ink tnum">{k}</dt>
          <dd className="mt-1 text-[13px] leading-5 text-ink-3">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectCard({ p, flip, problem, built }: { p: Project; flip: string; problem: string; built: string }) {
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  const front: ReactNode = (
    <div className="flex h-full flex-col">
      {p.image ? (
        <div className="h-[46%] overflow-hidden border-b hairline">
          <img alt="" className="h-full w-full object-cover object-top" loading="lazy" src={p.image} />
        </div>
      ) : (
        <div className="flex h-[46%] flex-col justify-end border-b hairline bg-deep p-5">
          <span className="font-mono text-[56px] font-medium leading-none text-ink tnum">{p.figure?.[0]}</span>
          <span className="mt-2 text-sm text-ink-3">{p.figure?.[1]}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs text-ink-3">{p.sector}</p>
        <h3 className="mt-2 text-[22px] font-medium leading-7">{p.title}</h3>
        <p className="mt-2 text-sm leading-5 text-ink-2">{p.problem}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Status label={p.status} live={p.live} />
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            <RotateCw size={14} strokeWidth={1.5} />
            {flip}
          </span>
        </div>
      </div>
    </div>
  );
  const back: ReactNode = (
    <div className="flex h-full flex-col p-6">
      <p className="font-mono text-xs text-ink-3">{problem}</p>
      <p className="mt-2 text-sm leading-5 text-ink-2">{p.problem}</p>
      <p className="mt-6 font-mono text-xs text-ink-3">{built}</p>
      <p className="mt-2 text-sm leading-[22px] text-ink">{p.built}</p>
      {p.note && <p className="mt-4 text-xs leading-4 text-ink-3">{p.note}</p>}
      {p.link && (
        <a
          className="mt-auto inline-flex items-center gap-1.5 self-start text-sm font-medium text-amber hover:underline"
          href={p.link.href}
          onPointerDown={stop}
        >
          {p.link.label}
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
  return (
    <CardFlip
      back={back}
      className="aspect-[4/5] w-full"
      faceClassName="border-[var(--line)] bg-card text-ink dark:border-[var(--line)] dark:bg-card dark:text-ink"
      front={front}
      label={p.title}
    />
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = content[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("av-lang", lang);
    } catch {
      /* not critical */
    }
  }, [lang]);

  const inv = t.invoices;

  return (
    <>
      <header className="sticky top-0 z-40 border-b hairline bg-page">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-6">
          <a className="text-[17px] font-semibold" href="#top">
            Andrea Vacchini
          </a>
          <div className="ml-auto hidden items-center gap-7 text-sm text-ink-2 md:flex">
            <a className="transition-colors duration-150 hover:text-ink" href="#progetti">{t.nav.projects}</a>
            <a className="transition-colors duration-150 hover:text-ink" href="#metodo">{t.nav.method}</a>
            <a className="transition-colors duration-150 hover:text-ink" href="#percorso">{t.nav.path}</a>
          </div>
          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <div className="flex rounded-[8px] border hairline p-0.5 font-mono text-xs">
              {(["it", "en"] as Lang[]).map((l) => (
                <button
                  aria-pressed={lang === l}
                  className={`h-7 rounded-[6px] px-2.5 uppercase transition-colors duration-150 ${lang === l ? "bg-raised text-ink" : "text-ink-3 hover:text-ink-2"}`}
                  key={l}
                  onClick={() => setLang(l)}
                  type="button"
                >
                  {l}
                </button>
              ))}
            </div>
            <a className="hidden h-9 items-center rounded-[8px] bg-ink px-4 text-sm font-medium text-deep transition-colors duration-150 hover:bg-white sm:inline-flex" href="#contatti">
              {t.nav.write}
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid min-h-[calc(100svh-64px)] max-w-[1200px] items-center gap-16 px-6 py-16 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <p className="font-mono text-xs text-ink-3">{t.hero.kicker}</p>
            <h1 className="mt-6 text-[42px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[60px]">{t.hero.title}</h1>
            <p className="mt-6 max-w-[36rem] text-lg leading-[30px] text-ink-2">{t.hero.sub}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a className={btnPrimary} href="#progetti">{t.hero.primary}</a>
              <a className={btnSecondary} download href={t.hero.cv}>
                <Download size={18} strokeWidth={1.5} />
                {t.hero.secondary}
              </a>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink-2">
              <span className="size-1.5 rounded-full bg-ok" />
              {t.hero.status}
            </p>
          </Reveal>
          <DiskPanel t={t.disk} />
        </section>

        {/* Numbers on the split-flap board */}
        <section className="border-y hairline bg-deep">
          <div className="mx-auto grid max-w-[1200px] gap-x-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.stats.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mx-auto max-w-[1200px] px-6 pt-32" id="progetti">
          <SectionHead sub={t.projectsSub} title={t.projectsTitle} />

          {/* Orbita */}
          <article className="grid items-center gap-12 border-t hairline py-16 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="font-mono text-xs text-ink-3">{t.orbita.sector}</p>
              <h3 className="mt-3 text-[40px] font-medium leading-none tracking-[-0.02em]">{t.orbita.title}</h3>
              <p className="mt-6 text-[17px] leading-7 text-ink-2">{t.orbita.problem}</p>
              <p className="mt-4 text-[17px] leading-7 text-ink">{t.orbita.built}</p>
              <Facts items={t.orbita.facts} />
              <p className="mt-6 font-mono text-xs leading-5 text-ink-3">{t.orbita.stack}</p>
              <a className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-amber hover:underline" href="orbita/">
                {t.orbita.link}
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </a>
            </Reveal>
            <TurnIn from="right">
              <div className="overflow-hidden rounded-[16px] border hairline bg-card shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
                <img alt="Orbita" className="block w-full" loading="lazy" src={t.orbita.image} />
              </div>
            </TurnIn>
          </article>

          {/* Invoice checker */}
          <article className="grid items-center gap-12 border-t hairline py-16 lg:grid-cols-[1fr_1fr]">
            <TurnIn className="order-2 flex justify-center lg:order-1" from="left">
              <div>
                <ReceiptPrinter
                  className="border-[var(--line)] bg-deep dark:border-[var(--line)] dark:bg-deep"
                  currency="€ "
                  date={inv.date}
                  items={inv.items}
                  labels={{
                    ...inv.labels,
                    footer: <span className="font-semibold text-[#b4261b]">{inv.diff}</span>,
                  }}
                  merchant={inv.merchant}
                  order={inv.order}
                  tax={0.22}
                />
                <p className="mt-4 text-center font-mono text-xs text-ink-3">{inv.demo}</p>
              </div>
            </TurnIn>
            <Reveal className="order-1 lg:order-2">
              <p className="font-mono text-xs text-ink-3">{inv.sector}</p>
              <h3 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.02em]">{inv.title}</h3>
              <p className="mt-6 text-[17px] leading-7 text-ink-2">{inv.problem}</p>
              <p className="mt-4 text-[17px] leading-7 text-ink">{inv.built}</p>
              <Facts items={inv.facts} />
              <div className="mt-6">
                <Status label={inv.status} live />
              </div>
            </Reveal>
          </article>

          {/* The rest, as cards that turn over */}
          <DealIn className="grid gap-6 border-t hairline pt-16 sm:grid-cols-2 lg:grid-cols-3">
            {t.projects.map((p) => (
              <div className="opacity-0" key={p.id}>
                <ProjectCard built={t.built} flip={t.flipHint} p={p} problem={t.problem} />
              </div>
            ))}
          </DealIn>
        </section>

        {/* Trades and other tools */}
        <section className="mx-auto max-w-[1200px] px-6 pt-32">
          <SectionHead sub={t.sectorsSub} title={t.sectorsTitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {t.sectors.map((s, i) => (
              <Reveal delay={i * 0.05} key={s.href}>
                <a className="group flex h-full flex-col rounded-[14px] border hairline bg-card p-6 transition-colors duration-150 hover:bg-raised" href={s.href}>
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-[22px] text-ink-2">{s.text}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-amber">
                    {t.demo}
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <h3 className="text-sm text-ink-3">{t.othersTitle}</h3>
            <ul className="mt-4 divide-y divide-[var(--line)] border-y hairline">
              {t.others.map((o) => (
                <li className="grid gap-1 py-4 sm:grid-cols-[220px_1fr]" key={o.title}>
                  <span className="text-[15px] font-medium">{o.title}</span>
                  <span className="text-[15px] text-ink-2">{o.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Method */}
        <section className="mx-auto max-w-[1200px] px-6 pt-32" id="metodo">
          <SectionHead title={t.methodTitle} />
          <DealIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.method.map(([h, p], i) => (
              <div className="rounded-[14px] border hairline bg-card p-6 opacity-0" key={h}>
                <span className="font-mono text-xs text-ink-3 tnum">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-medium">{h}</h3>
                <p className="mt-2 text-sm leading-[22px] text-ink-2">{p}</p>
              </div>
            ))}
          </DealIn>
          <Reveal className="mt-12 max-w-3xl border-l-2 border-amber pl-6">
            <h3 className="text-sm text-ink-3">{t.aiTitle}</h3>
            <p className="mt-2 text-xl leading-8">{t.ai}</p>
          </Reveal>
        </section>

        {/* Background */}
        <section className="mx-auto max-w-[1200px] px-6 pt-32" id="percorso">
          <SectionHead sub={t.pathIntro} title={t.pathTitle} />
          <ol className="border-t hairline">
            {t.path.map(([when, role, where], i) => (
              <Reveal delay={i * 0.04} key={when}>
                <li className="grid gap-1 border-b hairline py-5 md:grid-cols-[200px_320px_1fr] md:gap-6">
                  <span className="font-mono text-[13px] text-ink-3 tnum">{when}</span>
                  <span className="text-[15px] font-medium">{role}</span>
                  <span className="text-[15px] text-ink-2">{where}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <p className="mt-6 text-sm text-ink-3">{t.education}</p>
        </section>

        {/* Contact */}
        <section className="mx-auto max-w-[1200px] px-6 py-32" id="contatti">
          <Reveal className="rounded-[20px] border hairline bg-card p-8 sm:p-12">
            <h2 className="max-w-3xl text-[34px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[48px]">{t.contactTitle}</h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-7 text-ink-2">{t.contactSub}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a className={btnPrimary} href={`mailto:${contact.email}`}>
                <Mail size={18} strokeWidth={1.5} />
                {contact.email}
              </a>
              <a className={btnSecondary} href={`tel:${contact.tel}`}>
                <Phone size={18} strokeWidth={1.5} />
                {contact.phone}
              </a>
              <a className={btnSecondary} href={contact.whatsapp} rel="noopener" target="_blank">
                <MessageCircle size={18} strokeWidth={1.5} />
                {t.whatsapp}
              </a>
              <a className={btnSecondary} href={contact.linkedin} rel="noopener" target="_blank">
                LinkedIn
                <ArrowUpRight size={18} strokeWidth={1.5} />
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-8 text-sm text-ink-3">
          <span>© 2026 {t.footer}</span>
          <a className="hover:text-ink-2" download href={t.hero.cv}>{t.hero.secondary}</a>
        </div>
      </footer>
    </>
  );
}
