import Link from "next/link";
import { AppPreview } from "@/components/AppPreview";
import { Reveal } from "@/components/landing/Reveal";

// TODO: put the real WhatsApp number here (country code, no + or spaces), e.g. "94771234567"
const WHATSAPP_NUMBER = "94XXXXXXXXX";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I saw the GymFlow demo and I would like to know more."
)}`;

const PRIMARY_BTN =
  "inline-block rounded-xl bg-[#FF6A00] font-bold text-black transition-colors hover:bg-[#FF8533]";
const SECONDARY_BTN =
  "inline-block rounded-xl border border-kumo-line font-bold text-white transition-colors hover:bg-kumo-tint";

const QUESTIONS = [
  { q: "Is this member expired?", a: "Green, yellow or red in one second, with the word beside it." },
  { q: "Who still owes money?", a: "The balance shows on every member and at check-in." },
  { q: "Who should I call this week?", a: "A daily list of expiring members, with a Call link." },
];

const STEPS = [
  { title: "Member shows their card", text: "Scan the QR card, or type a name, phone number or member number." },
  { title: "See the colour", text: "Green means welcome. Yellow means expiring soon. Red means expired." },
  { title: "Take payment and renew", text: "Record cash or bank payments, renew in a click and print a receipt." },
];

const FEATURES = [
  { title: "Fast check-in", text: "Search or scan a member and see in a second if they are good to go." },
  { title: "Payments and receipts", text: "Record cash or bank payments, track balances and print a receipt." },
  { title: "Never miss a renewal", text: "A daily list shows who is expiring, so you can call them in time." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Sticky nav: the demo button is always in view */}
      <header className="sticky top-0 z-50 border-b border-kumo-line bg-[#121212]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="font-heading text-2xl font-semibold">
            Gym<span className="text-accent">Flow</span>
          </span>
          <nav className="flex items-center gap-6">
            <div className="hidden items-center gap-6 text-sm text-kumo-subtle sm:flex">
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
            <Link href="/app" className={`${PRIMARY_BTN} px-5 py-2.5 text-sm`}>
              Try the demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(255,106,0,0.16),transparent)] px-6 pb-14 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal as="h1" className="font-heading text-6xl font-semibold leading-none sm:text-8xl">
            Run your gym from <span className="text-accent">one simple screen.</span>
          </Reveal>
          <Reveal as="p" delay={100} className="mx-auto mt-6 max-w-xl text-lg text-kumo-subtle">
            Know in one second who can come in, who owes money, and who needs to renew.
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-col items-center gap-4">
            <Link href="/app" className={`${PRIMARY_BTN} px-8 py-4 text-lg`}>
              Try the demo
            </Link>
            <p className="text-sm text-kumo-subtle">
              No sign-up. 20 sample members. Your data stays in this browser.
            </p>
            <a href="#how" className="text-sm text-kumo-subtle underline underline-offset-4 hover:text-white">
              See how it works
            </a>
          </Reveal>
        </div>
      </section>

      {/* Product window */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <AppPreview />
      </section>

      <main className="mx-auto max-w-5xl px-6">
        {/* The three questions */}
        <section className="pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Every front desk asks the same three things.
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {QUESTIONS.map((item, i) => (
              <Reveal
                key={item.q}
                delay={i * 100}
                className="rounded-xl border border-kumo-line bg-kumo-base p-6"
              >
                <h3 className="font-heading text-3xl font-semibold leading-tight">{item.q}</h3>
                <p className="mt-3 text-kumo-subtle">{item.a}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-24 pb-16">
          <h2 className="font-heading text-4xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-kumo-line bg-kumo-base p-6">
                <div className="font-heading text-3xl font-semibold text-accent">{i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-kumo-subtle">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="grid scroll-mt-24 gap-4 pb-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-kumo-line bg-kumo-base p-6">
              <h2 className="font-heading text-2xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-kumo-subtle">{f.text}</p>
            </div>
          ))}
        </section>

        <section
          id="contact"
          className="mb-20 scroll-mt-24 rounded-2xl border border-kumo-line bg-kumo-base p-8 text-center"
        >
          <h2 className="font-heading text-4xl font-semibold">Want this for your gym?</h2>
          <p className="mx-auto mt-2 max-w-lg text-kumo-subtle">
            Try the demo with sample members, then message us and we will set it up for your gym.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/app" className={`${PRIMARY_BTN} px-6 py-3`}>
              Try the demo
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SECONDARY_BTN} px-6 py-3`}
            >
              Talk to us on WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-kumo-line py-6 text-center text-sm text-kumo-subtle">
        Demo data stays in your browser.
      </footer>
    </div>
  );
}