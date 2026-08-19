import { useState } from "react";
import { nav, site } from "./content";

const whatsappLabel = "Agendar consulta";

function LogoMark({ className }: { className: string }) {
  return (
    <img
      src="/brand/logo/seal.png"
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

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-marfim text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-marfim focus:px-3 focus:py-2"
      >
        Ir ao conteúdo
      </a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-terra/10 bg-marfim/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8 md:py-[1.35rem]">
          <a href="#topo" className="flex items-center gap-3 text-terra">
            <LogoMark className="h-11 w-11" />
            <span className="flex flex-col items-start leading-tight">
              <span className="-ml-[0.14em] font-display text-[1.15rem]">
                Ana Gonçalves
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-oliva-deep">
                Psiquiatra
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
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
            className="grid h-10 w-10 place-items-center text-terra md:hidden"
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
          <div className="border-t border-terra/10 px-5 py-4 md:hidden">
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
          className="relative flex min-h-dvh items-center overflow-hidden pt-24"
        >
          <img
            src="/brand/hero-floral.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-marfim/40" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-marfim to-transparent" />

          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-10 text-center">
            <LogoMark className="mb-4 h-16 w-16" />
            <h1 className="mt-2 font-display text-[2.6rem] leading-[0.92] text-terra md:text-6xl">
              <span className="relative inline-block">
                Ana
                <span className="absolute left-full top-2 ml-2 hidden font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-terra/70 sm:inline">
                  {site.title}
                </span>
              </span>
              <span className="block">Gonçalves</span>
            </h1>
            <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-ink/80">
              Escuta, clareza e decisões compartilhadas — sem fórmulas prontas.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
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
            <LogoMark className="mx-auto mb-8 h-20 w-20" />
            <p className="font-script text-3xl leading-snug md:text-4xl">
              {site.tagline}
            </p>
            <p className="mt-8 font-sans text-sm leading-relaxed text-areia/90 md:text-base">
              Cuidar de si é algo construído aos poucos. Há momentos de agir e
              transformar; outros, de aceitar o que não pode ser mudado e
              encontrar novas maneiras de seguir. Meu papel é estar presente
              nessa jornada — com conhecimento técnico e respeito à
              particularidade de cada pessoa.
            </p>
          </blockquote>
        </section>

        <section id="sobre" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-[1.6rem] bg-areia" />
            <img
              src="/brand/retrato.jpg"
              alt="Dra. Ana Gonçalves no consultório"
              className="relative z-10 aspect-[4/5] w-full rounded-[1.6rem] object-cover object-top"
            />
          </div>
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
              Sobre
            </p>
            <h2 className="mt-3 font-display text-4xl text-terra md:text-5xl">
              Rigor sem rigidez.
            </h2>
            <div className="mt-6 space-y-4 font-sans text-[15px] leading-relaxed text-ink/85">
              <p>
                Sou médica psiquiatra, formada em Medicina com residência pela
                Universidade Federal de Santa Catarina. Atendo adultos em
                Curitiba, no consultório e também online.
              </p>
              <p>
                Meu trabalho parte de evidências e de uma investigação
                criteriosa. Ao mesmo tempo, um tratamento seguro não deve ser
                aplicado de maneira automática: precisa considerar a história,
                o momento, a rotina e as possibilidades reais de cada pessoa.
              </p>
              <p>
                Mais do que uma prescrição imediata, busco produzir clareza e
                construir um caminho possível de seguir — com autonomia e
                acompanhamento ao longo do tempo.
              </p>
            </div>
            <p className="mt-6 font-sans text-sm text-terra/70">
              {site.crm} · {site.rqe} · {site.clinic}, {site.city}
            </p>
          </div>
        </section>

        <section id="cuidado" className="bg-areia/50 px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
              O cuidado
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-terra md:text-5xl">
              Quatro pilares que sustentam a consulta.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {[
                {
                  n: "01",
                  t: "Critério clínico e atualização",
                  d: "O cuidado parte do conhecimento médico e de evidências. Novas formações entram quando são relevantes, seguras e coerentes — não por tendência.",
                },
                {
                  n: "02",
                  t: "Escuta que produz clareza",
                  d: "Escutar não é só acolher. É organizar o que está acontecendo, explicar os caminhos disponíveis e permitir que você participe das decisões.",
                },
                {
                  n: "03",
                  t: "Flexibilidade responsável",
                  d: "Adaptar não é improvisar. É construir, dentro de limites seguros, a condução mais adequada e possível para aquela pessoa.",
                },
                {
                  n: "04",
                  t: "Mudança possível e sustentada",
                  d: "O tratamento não é uma fórmula que elimina toda dificuldade. É um processo acompanhado, que pode envolver medicação, hábitos, sono e articulação com outros profissionais.",
                },
              ].map((item) => (
                <article
                  key={item.n}
                  className="rounded-3xl bg-marfim p-7 shadow-[0_1px_0_rgb(120_72_78/0.08)]"
                >
                  <p className="font-display text-sm italic text-argila">{item.n}</p>
                  <h3 className="mt-2 font-display text-2xl text-terra">{item.t}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink/80">
                    {item.d}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="listras bg-oliva px-5 py-20 text-marfim md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
            <img
              src="/brand/logo/vertical-oliva.png"
              alt="Ana Gonçalves, psiquiatra"
              className="mx-auto max-h-56 w-full max-w-md object-contain md:max-h-72"
            />
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-areia">
                Para quem
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Adultos que precisam compreender o que está acontecendo.
              </h2>
              <p className="mt-5 max-w-xl font-sans text-[15px] leading-relaxed text-marfim/90">
                Atendo principalmente pessoas entre 30 e 50 anos com sofrimento
                emocional, alterações de humor, ansiedade, sono ou prejuízos na
                rotina. A marca não se limita a um único tema: sono e estilo de
                vida entram quando fazem parte do cuidado — não como uma
                promessa isolada.
              </p>
              <ul className="mt-8 space-y-4 font-sans text-sm leading-relaxed">
                {[
                  "Compreender se há indicação de tratamento",
                  "Receber orientação clara sobre possibilidades e limites",
                  "Encontrar um plano possível de seguir na vida real",
                  "Preservar autonomia e participar das escolhas",
                ].map((line) => (
                  <li
                    key={line}
                    className="border-b border-marfim/20 pb-4 last:border-0"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="consulta" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
            A consulta
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl text-terra md:text-5xl">
            Presencial em Curitiba e online.
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-ink/80">
            A primeira conversa serve para entender o contexto, organizar as
            informações e construir, juntos, os próximos passos. Sem pressa e
            sem protocolo aplicado no automático.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Escuta e investigação",
                d: "História, momento atual, rotina, receios e o que já foi tentado. O objetivo é sair com mais clareza — não com um rótulo apressado.",
              },
              {
                t: "Caminhos possíveis",
                d: "Explico benefícios, limites e alternativas. O plano pode incluir medicação, mudanças sustentáveis e trabalho em rede com outros profissionais.",
              },
              {
                t: "Acompanhamento",
                d: "Tratamento é processo. Reavaliamos o que funciona, o que pesa e o que precisa ser ajustado à sua realidade.",
              },
            ].map((step, i) => (
              <article
                key={step.t}
                className="rounded-3xl border border-terra/10 bg-areia/30 p-7 transition duration-300 ease-out hover:-translate-y-1.5 hover:border-terra/20 hover:bg-marfim hover:shadow-[0_12px_32px_rgb(120_72_78/0.12)]"
              >
                <p className="font-display text-argila">0{i + 1}</p>
                <h3 className="mt-2 font-display text-2xl text-terra">{step.t}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/80">
                  {step.d}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="relative overflow-hidden px-5 py-24 md:px-8"
          style={{ backgroundImage: "url('/brand/flor.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
        >
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

        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-24">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-oliva-deep">
            Dúvidas
          </p>
          <h2 className="mt-3 font-display text-4xl text-terra">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-terra/10">
            {[
              {
                q: "A consulta é presencial ou online?",
                a: "As duas. Atendo em Curitiba, na Clínica Cuidar, e também por telemedicina — com a mesma seriedade e sigilo.",
              },
              {
                q: "Qual é o público?",
                a: "Adultos, sobretudo quem busca avaliação por humor, ansiedade, sono ou impacto na rotina. A atuação é ampla em saúde mental; não se restringe a um único tema.",
              },
              {
                q: "Atende convênio?",
                a: "Confirme a modalidade no agendamento pelo WhatsApp. O consultório particular permite o tempo e a flexibilidade que esse cuidado pede.",
              },
              {
                q: "Como é a primeira consulta?",
                a: "Uma conversa para entender o que está acontecendo, suas dúvidas e o que é possível neste momento. Saímos com direção — mesmo quando o diagnóstico ainda se constrói ao longo do acompanhamento.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none font-display text-xl text-terra marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="mt-1 font-sans text-oliva-deep group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="linen bg-terra px-5 py-4 text-marfim md:px-8 md:py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <img
              src="/brand/logo/vertical-terra.png"
              alt="Ana Gonçalves, psiquiatra"
              className="h-24 w-auto max-w-[180px] object-contain object-left md:h-28 md:max-w-[210px]"
            />
            <p className="mt-1 max-w-sm font-script text-base leading-snug text-areia md:text-lg">
              {site.tagline}
            </p>
          </div>
          <div className="grid gap-4 font-sans text-sm text-areia sm:grid-cols-2 sm:gap-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-oliva">Contato</p>
              <a href={site.whatsappUrl} className="mt-1.5 block hover:text-marfim">
                WhatsApp {site.whatsappDisplay}
              </a>
              <a href={site.instagramUrl} className="mt-1 block hover:text-marfim">
                @{site.instagram}
              </a>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-oliva">Consultório</p>
              <p className="mt-1.5">
                {site.clinic}
                <br />
                {site.city}/PR · Presencial e online
              </p>
              <p className="mt-1 text-areia/80">
                {site.crm} · {site.rqe}
              </p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-6xl border-t border-marfim/15 pt-2.5 font-sans text-[11px] text-areia/70">
          Protótipo de identidade. CRM, WhatsApp e endereço devem ser confirmados
          antes da publicação. Responsável técnico: Dra. Ana Heloisa Gonçalves.
        </p>
      </footer>

      <a
        href={site.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir WhatsApp"
        className="fixed bottom-16 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-argila text-marfim shadow-lg transition hover:bg-terra md:bottom-[4.5rem] md:right-8"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
