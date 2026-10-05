import { Reveal } from "@/components/landing/Reveal";
import { LIGHT } from "@/components/landing/shared";

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

// Section 7 (off-white): questions and answers, using plain <details> so it works without JavaScript.
export function Faq() {
  return (
    <section id="faq" className={`scroll-mt-20 ${LIGHT}`}>
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-24 sm:pt-24">
        <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-6xl">
          Questions.
        </Reveal>
        <div className="mt-8 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6 py-4">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span
                  aria-hidden="true"
                  className="text-2xl text-[#C2410C] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-2 pt-1 text-black/60">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}