import { Reveal } from "@/components/landing/Reveal";
import { DemoButton, LIGHT } from "@/components/landing/shared";

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

// Section 5 (off-white): explains the demo's Owner and Receptionist sign-ins.
export function DemoRoles() {
  return (
    <section id="demo" className={`scroll-mt-20 ${LIGHT}`}>
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 sm:pt-24">
        <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-6xl">
          Try it as the owner or the receptionist.
        </Reveal>
        <Reveal as="p" delay={100} className="mt-3 max-w-xl text-black/60">
          The demo opens with a sign-in screen. There is no password. Pick a person and see what
          they would see.
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 100} className="rounded-2xl bg-[#121212] p-6 text-white">
              <h3 className="font-heading text-3xl font-semibold text-accent">{r.title}</h3>
              <p className="mt-2 text-white/70">{r.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <DemoButton />
        </div>
      </div>
    </section>
  );
}