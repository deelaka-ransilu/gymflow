"use client";
import { useRouter } from "next/navigation";
import { Button } from "@cloudflare/kumo";

const features = [
  { title: "Fast check-in", text: "Search or scan a member and see in a second if they are good to go." },
  { title: "Payments and receipts", text: "Record cash or bank payments, track balances and print a receipt." },
  { title: "Never miss a renewal", text: "A daily list shows who is expiring, so you can call them in time." },
];

export default function Landing() {
  const router = useRouter();
  const goDemo = () => router.push("/app/check-in");
  const goHow = () => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-heading text-2xl font-semibold">
          Gym<span className="text-accent">Flow</span>
        </span>
        <Button variant="primary" onClick={goDemo}>Try the demo</Button>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-20 sm:py-28">
          <h1 className="font-heading text-6xl font-semibold leading-none sm:text-8xl">
            Run your gym from <span className="text-accent">one simple screen.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-kumo-subtle">
            Check-ins, payments and renewals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={goDemo}>Try the demo</Button>
            <Button variant="secondary" size="lg" onClick={goHow}>See how it works</Button>
          </div>
        </section>

        <section id="how" className="grid gap-4 pb-20 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-kumo-line bg-kumo-base p-6">
              <h2 className="font-heading text-2xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-kumo-subtle">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-kumo-line py-6 text-center text-sm text-kumo-subtle">
        Demo data stays in your browser.
      </footer>
    </div>
  );
}