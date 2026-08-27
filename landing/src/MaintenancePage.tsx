import { maintenance, site } from "./content";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.55-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-marfim px-5 py-16 text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-oliva/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-argila/15"
      />

      <main className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <img
          src="/brand/logo/oficial/selo-terra.png"
          alt="Ana Gonçalves"
          className="h-24 w-24 object-contain"
        />

        <p className="mt-6 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-oliva-deep">
          {site.name} · {site.title}
        </p>

        <h1 className="mt-4 font-display text-[2rem] leading-tight text-terra md:text-[2.35rem]">
          {maintenance.title}
        </h1>

        <p className="mt-4 font-sans text-[15px] leading-7 text-ink/85">
          {maintenance.message}
        </p>

        <p className="mt-3 font-sans text-sm leading-6 text-ink/70">
          {maintenance.note}
        </p>

        <a
          href={site.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-terra px-5 py-3 font-sans text-[14px] font-semibold text-marfim transition hover:bg-terra-deep"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp {site.whatsappDisplay}
        </a>

        <p className="mt-8 font-sans text-xs text-ink/55">
          {site.clinic} · {site.city}
        </p>
      </main>
    </div>
  );
}
