import { Reveal } from "@/components/landing/Reveal";
import { DARK, DemoButton } from "@/components/landing/shared";

const PLATES = [
  {
    label: "Active",
    color: "#22C55E",
    title: "Welcome. Let them in.",
    text: "The visit is logged automatically. Nothing else to do.",
  },
  {
    label: "Expiring soon",
    color: "#FACC15",
    title: "Expiring soon. Ask them to renew.",
    text: "It says how many days are left, so the conversation is easy.",
  },
  {
    label: "Expired",
    color: "#EF4444",
    title: "Expired. Stop and renew.",
    text: "You can still let them in if you choose. The override is recorded.",
  },
];

// Section 3 (black): green, yellow and red plates.
export function StatusPlates() {
  return (
    <section id="see" className={`scroll-mt-20 ${DARK}`}>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-24">
        <Reveal as="h2" className="font-heading text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
          Green. Yellow. Red.
        </Reveal>
        <Reveal as="p" delay={100} className="mt-4 max-w-xl text-lg text-kumo-subtle">
          Every member lands on one of three plates. The word is always beside the colour.
        </Reveal>
        <div className="mt-14 grid gap-14 sm:grid-cols-3 sm:gap-8">
          {PLATES.map((p, i) => (
            <Reveal key={p.label} delay={i * 120} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border-[10px]"
                  style={{
                    borderColor: p.color,
                    background: `radial-gradient(circle at 35% 30%, ${p.color}55, ${p.color}1f 70%)`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-[11%] rounded-full border-2"
                  style={{ borderColor: `${p.color}66` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-[22%] rounded-full border"
                  style={{ borderColor: `${p.color}33` }}
                />
                <span
                  className="font-heading absolute inset-x-0 top-[27%] text-2xl font-semibold sm:text-3xl"
                  style={{ color: p.color }}
                >
                  {p.label}
                </span>
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-400 bg-[#121212]"
                />
              </div>
              <h3
                className="font-heading mt-6 text-3xl font-semibold leading-tight"
                style={{ color: p.color }}
              >
                {p.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-kumo-subtle">{p.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <DemoButton />
        </div>
      </div>
    </section>
  );
}