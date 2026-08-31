import { useId, useState } from "react";
import { copy, nav, site } from "./content";

const whatsappLabel = "Agendar consulta";

function LogoMark({
  className,
  variant = "terra",
}: {
  className: string;
  variant?: "terra" | "areia" | "oliva" | "argila";
}) {
  const src = {
    terra: "/brand/logo/oficial/selo-terra.png",
    areia: "/brand/logo/oficial/selo-areia.png",
    oliva: "/brand/logo/oficial/selo-oliva.png",
    argila: "/brand/logo/oficial/selo-argila.png",
  }[variant];

  return (
    <img
      src={src}
      alt="Ana Gonçalves"
      className={`object-contain ${className}`}
    />
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.55-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  const uid = useId();
  const gradId = `ig-grad-${uid}`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill={`url(#${gradId})`} />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
      />
      <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
    </svg>
  );
}

function StarRating({ light = false }: { light?: boolean }) {
  const starClass = light ? "text-areia" : "text-argila";
  const scoreClass = light ? "text-marfim" : "text-terra";
  const labelClass = light ? "text-marfim/60" : "text-terra/55";

  return (
    <div
      className="flex items-center gap-2.5"
      aria-label="Avaliação 5 de 5 estrelas, verificada"
    >
      <div className={`flex gap-1 ${starClass}`} aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" className="h-[18px] w-[18px] fill-current">
            <path d="M10 1.5 12.6 7l6 0.9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L1.4 7.9l6-.9L10 1.5Z" />
          </svg>
        ))}
      </div>
      <span className={`font-display text-lg leading-none ${scoreClass}`}>
        5,0
      </span>
      <span
        className={`hidden font-sans text-[10px] font-medium uppercase tracking-[0.18em] sm:inline ${labelClass}`}
      >
        · verificado
      </span>
    </div>
  );
}

/** Grid editorial 12 col — larguras diferentes por depoimento. */
const depoimentoGridClass: Record<string, string> = {
  "G.":
    "md:col-span-7 lg:col-span-8",
  "K. B.":
    "md:col-span-5 lg:col-span-4",
  "E. S.":
    "md:col-span-4 lg:col-span-5",
  "A. C.":
    "md:col-span-8 lg:col-span-7",
};

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-marfim text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-marfim focus:px-3 focus:py-2"
      >
        Ir ao conteúdo
      </a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-terra/10 bg-marfim/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8 md:py-[1.35rem]">
          <a href="#topo" className="flex items-center gap-3 text-terra">
            <LogoMark variant="oliva" className="h-14 w-14 md:h-16 md:w-16" />
            <span className="flex flex-col items-start leading-tight">
              <span className="-ml-[0.14em] font-display text-[1.15rem]">
                Ana Gonçalves
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-oliva-deep">
                Psiquiatra
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-sans text-[13px] font-medium tracking-wide text-terra/80 transition hover:text-terra"
              >
                {item.label}
              </a>
            ))}
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-terra px-4 py-2 font-sans text-[13px] font-semibold text-marfim transition hover:bg-terra-deep"
            >
              {whatsappLabel}
            </a>
          </nav>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center text-terra lg:hidden"
            aria-expanded={open}
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current" />
            </span>
          </button>
        </div>
        {open ? (
          <div className="border-t border-terra/10 px-5 py-4 lg:hidden">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 font-sans text-sm text-terra"
              >
                {item.label}
              </a>
            ))}
            <a
              href={site.whatsappUrl}
              className="mt-3 inline-flex rounded-full bg-terra px-4 py-2 text-sm font-semibold text-marfim"
            >
              {whatsappLabel}
            </a>
          </div>
        ) : null}
      </header>

      <main id="conteudo">
        <section
          id="topo"
          className="relative flex min-h-dvh w-full items-center overflow-hidden pt-24"
        >
          <div className="absolute inset-0 overflow-hidden bg-marfim">
            {/* Mobile: 21 original (retrato). Desktop: 21-hero paisagem. */}
            <img
              src="/brand/oficial/21.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
            />
            <img
              src="/brand/oficial/21-hero.jpg"
              alt=""
              className="absolute left-1/2 top-[62%] hidden h-[112%] w-[112%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-180 object-cover md:block"
            />
            <div className="absolute inset-0 bg-marfim/25" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center">
            <h1 className="mb-1">
              <img
                src="/brand/logo/oficial/logo-vertical-claro.png"
                alt="Ana Gonçalves, psiquiatra"
                className="mx-auto h-auto w-full max-w-[240px] object-contain sm:max-w-[280px] md:max-w-[320px]"
              />
            </h1>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-argila px-6 py-3 font-sans text-sm font-semibold text-marfim shadow-sm transition hover:bg-terra"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {whatsappLabel}
              </a>
              <a
                href="#cuidado"
                className="inline-flex rounded-full border border-terra/25 bg-marfim/50 px-6 py-3 font-sans text-sm font-medium text-terra backdrop-blur-sm transition hover:border-terra/50"
              >
                Como eu cuido
              </a>
            </div>
            <p className="mt-5 font-sans text-[11px] tracking-wide text-terra/55">
              {site.crm} · {site.rqe}
            </p>
          </div>
        </section>

        <section className="linen bg-terra px-6 py-16 text-marfim md:py-20">
          <blockquote className="mx-auto max-w-3xl text-center">
            <LogoMark variant="areia" className="mx-auto mb-8 h-20 w-20" />
            <p className="font-script text-3xl leading-snug md:text-4xl">
              {site.tagline}
            </p>
            <p className="mt-6 font-script text-2xl leading-snug text-marfim/95 md:text-3xl">
              {site.taglineSecondary}
            </p>
          </blockquote>
        </section>

        <section
          id="sobre"
          className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28"
        >
          <div className="relative md:sticky md:top-28">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-[1.6rem] bg-areia" />
            <img
              src="/brand/retrato.jpg"
              alt="Dra. Ana Gonçalves no consultório"
              className="relative z-10 aspect-[4/5] w-full rounded-[1.6rem] object-cover object-top"
            />
          </div>
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
              {copy.sobre.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl text-terra md:text-5xl">
              {copy.sobre.title}
            </h2>
            <p className="mt-2 font-display text-xl italic text-argila md:text-2xl">
              {copy.sobre.subtitle}
            </p>
            <div className="mt-6 space-y-4 font-sans text-[15px] leading-relaxed text-ink/85">
              {copy.sobre.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 font-sans text-sm text-terra/70">
              {site.crm} · {site.rqe} · {site.clinic}, {site.city}
            </p>
          </div>
        </section>

        <section id="cuidado" className="bg-areia/50 px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-4xl text-terra md:text-5xl">
              {copy.cuidado.title}
            </h2>
            <div className="mt-8 space-y-5 font-sans text-[15px] leading-relaxed text-ink/85">
              {copy.cuidado.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section
          id="para-quem"
          className="listras bg-oliva px-5 py-20 text-marfim md:px-8 md:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
            <img
              src="/brand/logo/oficial/logo-vertical-fundo-oliva.png"
              alt="Ana Gonçalves, psiquiatra"
              className="mx-auto max-h-56 w-full max-w-md object-contain md:max-h-72"
            />
            <div>
              <h2 className="font-display text-4xl md:text-5xl">
                {copy.paraQuem.title}
              </h2>
              <p className="mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-marfim/90">
                {copy.paraQuem.body}
              </p>
            </div>
          </div>
        </section>

        <section id="abordagens" className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <h2 className="font-display text-4xl text-terra md:text-5xl">
            {copy.abordagens.title}
          </h2>
          <p className="mt-5 font-script text-2xl leading-snug text-argila md:text-3xl">
            {copy.abordagens.quote}
          </p>
          <div className="mt-8 space-y-5 font-sans text-[15px] leading-relaxed text-ink/85">
            {copy.abordagens.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </section>

        <section id="consulta" className="bg-areia/40 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
              {copy.consulta.eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-terra md:text-5xl">
              {copy.consulta.title}
            </h2>
            <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-ink/80">
              {copy.consulta.intro}
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {copy.consulta.steps.map((step, i) => (
                <article
                  key={step.t}
                  className="rounded-3xl border border-terra/10 bg-marfim p-7 transition duration-300 ease-out hover:-translate-y-1.5 hover:border-terra/20 hover:shadow-[0_12px_32px_rgb(120_72_78/0.12)]"
                >
                  <p className="font-display text-argila">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl text-terra">{step.t}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink/80">
                    {step.d}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-24 md:px-8">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/brand/oficial/06.jpg"
              alt=""
              className="absolute left-1/2 top-1/2 h-[145%] w-[145%] max-w-none -translate-x-1/2 -translate-y-[66%] object-cover md:h-[120%] md:w-[120%] md:-translate-y-[42%]"
            />
          </div>
          <div className="absolute inset-0 bg-marfim/78" />
          <div className="relative mx-auto max-w-2xl text-center">
            <LogoMark className="mx-auto h-16 w-16" />
            <h2 className="mt-6 font-display text-4xl text-terra md:text-5xl">
              Você será ouvido com atenção.
            </h2>
            <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink/80">
              E participará de um cuidado criterioso, claro e construído de
              acordo com suas necessidades e possibilidades reais.
            </p>
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-terra px-7 py-3.5 font-sans text-sm font-semibold text-marfim transition hover:bg-terra-deep"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </section>

        <section
          id="depoimentos"
          className="relative overflow-hidden border-y border-terra/8 px-5 py-20 md:px-8 md:py-28"
        >
          {/* Mobile: portrait original · Desktop: rotacionada em paisagem */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src="/brand/oficial/11.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
              aria-hidden
            />
            <div
              className="absolute left-1/2 top-1/2 hidden h-[110vw] w-[130vh] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 scale-110 bg-cover bg-center md:block"
              style={{ backgroundImage: "url(/brand/oficial/11.jpg)" }}
              aria-hidden
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-marfim/42" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
                {copy.depoimentos.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl text-terra md:text-5xl">
                {copy.depoimentos.title}
              </h2>
              <p className="mt-4 font-script text-2xl leading-snug text-argila md:text-3xl">
                {copy.depoimentos.subtitle}
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:gap-x-7 md:gap-y-7 lg:gap-x-8 lg:gap-y-8">
              {copy.depoimentos.items.map((item) => (
                  <blockquote
                    key={item.initials}
                    className={`relative rounded-2xl border border-terra/12 bg-marfim/94 px-7 py-6 shadow-[0_8px_32px_rgb(120_72_78/0.12)] md:px-8 md:py-7 ${
                      depoimentoGridClass[item.initials] ?? "md:col-span-6"
                    }`}
                  >
                    <span
                      className="pointer-events-none absolute inset-y-5 left-0 w-1 rounded-full bg-argila"
                      aria-hidden
                    />
                    <StarRating />
                    <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink/88">
                      <span
                        className="mr-1 font-script text-3xl leading-none text-argila/55"
                        aria-hidden
                      >
                        “
                      </span>
                      {item.text}
                      <span
                        className="ml-0.5 font-script text-3xl leading-none text-argila/55"
                        aria-hidden
                      >
                        ”
                      </span>
                    </p>
                    <footer className="mt-5 flex items-center gap-3">
                      <span className="font-sans text-sm font-medium text-terra">
                        {item.initials}
                      </span>
                      <span className="h-px w-6 bg-terra/15" aria-hidden />
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-oliva-deep">
                        Paciente
                      </span>
                    </footer>
                  </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-24">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
            Dúvidas
          </p>
          <h2 className="mt-3 font-display text-4xl text-terra">
            Perguntas frequentes
          </h2>
          <div className="mt-10 divide-y divide-terra/10">
            {copy.faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none font-display text-xl text-terra marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="mt-1 font-sans text-oliva-deep group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/80">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="linen bg-terra px-5 py-6 pb-24 text-marfim md:py-7 md:pb-7">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8">
          <div className="flex items-center gap-3 md:translate-x-[50px]">
            <LogoMark variant="areia" className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
            <p className="font-sans text-[15px] leading-snug text-areia md:text-base">
              {site.fullName}
              <br />
              {site.titleLong}
              <br />
              {site.crm} · {site.rqe}
            </p>
          </div>

          <div className="w-full max-w-sm font-sans text-sm leading-snug text-areia md:w-auto md:max-w-none md:-translate-x-[50px]">
            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-oliva">
              Contato
            </p>
            <div className="mt-1.5">
              <p className="text-center text-marfim">{site.clinic}</p>
              <div className="mt-1.5 space-y-1.5 pl-10">
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 hover:text-marfim"
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center">
                    <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                  </span>
                  WhatsApp {site.whatsappDisplay}
                </a>
                <a
                  href={site.emailUrl}
                  className="flex items-center gap-2.5 hover:text-marfim"
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center">
                    <EmailIcon className="h-3.5 w-3.5 text-white" />
                  </span>
                  {site.email}
                </a>
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 hover:text-marfim"
                >
                  <span className="relative grid h-4 w-4 shrink-0 place-items-center">
                    <MapPinIcon className="absolute h-[18px] w-[18px] text-[#4285F4]" />
                  </span>
                  <span>
                    Rua Ébano Pereira, 60, sala 1705,
                    <br />
                    Centro — {site.addressCity}
                  </span>
                </a>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <a
                    href={site.clinicInstagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 hover:text-marfim"
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center">
                      <InstagramIcon className="h-3.5 w-3.5" />
                    </span>
                    @{site.clinicInstagram}
                  </a>
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 hover:text-marfim"
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center">
                      <InstagramIcon className="h-3.5 w-3.5" />
                    </span>
                    @{site.instagram}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <a
        href={site.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir WhatsApp"
        className="fixed bottom-16 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:bg-[#1ebe57] md:bottom-[4.5rem] md:right-8"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
