import Link from "next/link";
import { AppPreview } from "@/components/AppPreview";
import { Reveal } from "@/components/landing/Reveal";
import {
  CheckInPicture,
  ExpiringPicture,
  ReceiptPicture,
} from "@/components/landing/ScreenPictures";

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

const PANELS = [
  {
    label: "Active",
    title: "Welcome. Let them in.",
    text: "The visit is logged automatically. Nothing else to do.",
    box: "border-green-500/40 bg-green-500/10",
    head: "text-green-500",
  },
  {
    label: "Expiring soon",
    title: "Expiring soon. Ask them to renew.",
    text: "It says how many days are left, so the conversation is easy.",
    box: "border-yellow-400/40 bg-yellow-400/10",
    head: "text-yellow-400",
  },
  {
    label: "Expired",
    title: "Expired. Stop and renew.",
    text: "You can still let them in if you choose. The override is recorded.",
    box: "border-red-500/40 bg-red-500/10",
    head: "text-red-500",
  },
];

const DAY = [
  {
    title: "Check the member in",
    text: "Scan the QR card, or type a name, phone number or member number. The screen turns green, yellow or red and shows the balance owed.",
    picture: <CheckInPicture />,
  },
  {
    title: "Take payment, print the receipt",
    text: "Record cash or a bank transfer. Part-payments are fine, and the balance is tracked for you. Print a receipt for the member.",
    picture: <ReceiptPicture />,
  },
  {
    title: "Call before they expire",
    text: "Each morning, see who expires today, in the next three days and later in the week. Tap Call, and Renew when they come in.",
    picture: <ExpiringPicture />,
  },
];

const ROLES = [
  {
    title: "Owner",
    text: "Sees everything: the money, the backup page, and can cancel a payment.",
  },
  {
    title: "Receptionist",
    text: "Check-in, members and payments. No revenue figures and no backup page.",
  },
];

const FAQ = [
  {
    q: "Where does the demo data go?",
    a: "It stays in your browser on your own device. Nothing is sent to a server, and you can reset it any time.",
  },
  {
    q: "Do members need an app?",
    a: "No. Each member gets a printed QR card to show at the desk.",
  },
  {
    q: "Can the receptionist see how much money we make?",
    a: "No. Revenue and the backup page are only for the owner.",
  },
  {
    q: "How do I back up my data?",
    a: "The owner opens the Backup page and exports everything to a file. The same page can import it again.",
  },
];

function DemoButton({ size = "lg" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/app"
      className={`${PRIMARY_BTN} ${size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3"}`}
    >
      Try the demo
    </Link>
  );
}

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
            <div className="hidden items-center gap-6 text-sm text-kumo-subtle md:flex">
              <a href="#day" className="hover:text-white">How it works</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
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
            <DemoButton />
            <p className="text-sm text-kumo-subtle">
              No sign-up. 20 sample members. Your data stays in this browser.
            </p>
            <a href="#day" className="text-sm text-kumo-subtle underline underline-offset-4 hover:text-white">
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

        {/* Three colours */}
        <section className="pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Green. Yellow. Red.
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PANELS.map((p, i) => (
              <Reveal
                key={p.label}
                delay={i * 100}
                className={`flex min-h-[20rem] flex-col justify-between rounded-2xl border p-6 sm:min-h-[26rem] ${p.box}`}
              >
                <span className="text-sm font-medium text-kumo-subtle">{p.label}</span>
                <div>
                  <h3 className={`font-heading text-5xl font-semibold leading-none ${p.head}`}>
                    {p.title}
                  </h3>
                  <p className="mt-4 text-kumo-subtle">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <DemoButton />
          </div>
        </section>

        {/* Your day at the desk */}
        <section id="day" className="scroll-mt-24 pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Your day at the desk.
          </Reveal>
          <div className="mt-10 space-y-16">
            {DAY.map((row, i) => (
              <Reveal key={row.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                <div className={i % 2 === 1 ? "md:order-last" : ""}>
                  <h3 className="font-heading text-3xl font-semibold sm:text-4xl">{row.title}</h3>
                  <p className="mt-3 max-w-md text-kumo-subtle">{row.text}</p>
                </div>
                {row.picture}
              </Reveal>
            ))}
          </div>
        </section>

        {/* Demo sign-ins */}
        <section id="demo" className="scroll-mt-24 pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Try it as the owner or the receptionist.
          </Reveal>
          <Reveal as="p" delay={100} className="mt-3 max-w-xl text-kumo-subtle">
            The demo opens with a sign-in screen. There is no password. Pick a person and see what
            they would see.
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ROLES.map((r, i) => (
              <Reveal
                key={r.title}
                delay={i * 100}
                className="rounded-xl border border-kumo-line bg-kumo-base p-6"
              >
                <h3 className="font-heading text-3xl font-semibold">{r.title}</h3>
                <p className="mt-2 text-kumo-subtle">{r.text}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <DemoButton />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Pricing.
          </Reveal>
          <Reveal className="mt-8 rounded-2xl border border-[#FF6A00]/40 bg-kumo-base p-8 sm:p-10">
            <h3 className="font-heading text-4xl font-semibold">Founding gym offer</h3>
            <p className="font-heading mt-1 text-3xl text-accent">Talk to us</p>
            <p className="mt-4 max-w-lg text-kumo-subtle">
              We are looking for our first gyms. Tell us how your front desk works today, and we
              will agree a fair price together.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`${PRIMARY_BTN} mt-6 px-6 py-3`}
            >
              Talk to us on WhatsApp
            </a>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 pb-24">
          <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-5xl">
            Questions.
          </Reveal>
          <div className="mt-8 divide-y divide-kumo-line overflow-hidden rounded-xl border border-kumo-line bg-kumo-base">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-6 py-4">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.q}
                  <span aria-hidden="true" className="text-2xl text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-2 pt-1 text-kumo-subtle">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section
          id="contact"
          className="mb-20 scroll-mt-24 rounded-2xl border border-kumo-line bg-kumo-base px-6 py-16 text-center"
        >
          <Reveal as="h2" className="font-heading text-5xl font-semibold sm:text-6xl">
            Try it with 20 sample members.
          </Reveal>
          <Reveal as="p" delay={100} className="mx-auto mt-3 max-w-md text-kumo-subtle">
            Five minutes is enough to see if it fits your front desk.
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-col items-center gap-4">
            <DemoButton />
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SECONDARY_BTN} px-6 py-3`}
            >
              Talk to us on WhatsApp
            </a>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-kumo-line py-6 text-center text-sm text-kumo-subtle">
        Demo data stays in your browser.
      </footer>
    </div>
  );
}