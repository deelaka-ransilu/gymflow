import { Reveal } from "@/components/landing/Reveal";
import { DARK, DemoButton } from "@/components/landing/shared";
import platesImg from "../../../assests/landing/status-plates.png";

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

// Section 3 (black): the heading and the three statuses on the left, the 3D plates
// picture on the right. On phones the picture goes above the text.
export function StatusPlates() {
  return (
    <section id="see" className={`scroll-mt-20 ${DARK}`}>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text: left on desktop */}
          <div>
            <Reveal
              as="h2"
              className="font-heading text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl"
            >
              Green. Yellow. Red.
            </Reveal>
            <Reveal as="p" delay={100} className="mt-4 max-w-xl text-lg text-kumo-subtle">
              Every member lands on one of three plates. The word is always beside the colour.
            </Reveal>

            <div className="mt-10 space-y-8">
              {PLATES.map((p, i) => (
                <Reveal key={p.label} delay={i * 120}>
                  <div className="border-l-4 pl-5" style={{ borderColor: p.color }}>
                    {/* The colour always comes with a word label, never alone. */}
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ color: p.color, background: `${p.color}26` }}
                    >
                      {p.label}
                    </span>
                    <h3
                      className="font-heading mt-2 text-3xl font-semibold leading-tight"
                      style={{ color: p.color }}
                    >
                      {p.title}
                    </h3>
                    <p className="mt-1 max-w-md text-kumo-subtle">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12">
              <DemoButton />
            </div>
          </div>

          {/* Picture: right on desktop, above the text on phones. Decoration only, so no alt text. */}
          <Reveal className="order-first mx-auto w-full max-w-md lg:order-last lg:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={platesImg.src}
              width={platesImg.width}
              height={platesImg.height}
              alt=""
              aria-hidden="true"
              className="h-auto w-full object-contain"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}