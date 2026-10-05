"use client";
import { useRouter } from "next/navigation";
import { Button } from "@cloudflare/kumo";
import { AppPreview } from "@/components/AppPreview";

// TODO: put the real WhatsApp number here (country code, no + or spaces), e.g. "94771234567"
const WHATSAPP_NUMBER = "94XXXXXXXXX";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I saw the GymFlow demo and I would like to know more."
)}`;

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
  const router = useRouter();
  const goDemo = () => router.push("/app");
  const goHow = () => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-heading text-2xl font-semibold">
          Gym<span className="text-accent">Flow</span>
        </span>
        <Button variant="primary" onClick={goDemo}>
          Try the demo
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="mx-auto max-w-3xl pb-14 pt-12 text-center sm:pt-20">
          <h1 className="font-heading text-6xl font-semibold leading-none sm:text-8xl">
            Run your gym from <span className="text-accent">one simple screen.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-kumo-subtle">
            Know in one second who can come in, who owes money, and who needs to renew.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" onClick={goDemo}>
              Try the demo
            </Button>
            <Button variant="secondary" size="lg" onClick={goHow}>
              See how it works
            </Button>
          </div>
        </section>

        <section className="pb-24">
          <AppPreview />
        </section>

        <section id="how" className="scroll-mt-6 pb-16">
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

        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-kumo-line bg-kumo-base p-6">
              <h2 className="font-heading text-2xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-kumo-subtle">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="mb-20 rounded-2xl border border-kumo-line bg-kumo-base p-8 text-center">
          <h2 className="font-heading text-4xl font-semibold">Want this for your gym?</h2>
          <p className="mx-auto mt-2 max-w-lg text-kumo-subtle">
            Try the demo with sample members, then message us and we will set it up for your gym.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" onClick={goDemo}>
              Try the demo
            </Button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                Talk to us on WhatsApp
              </Button>
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