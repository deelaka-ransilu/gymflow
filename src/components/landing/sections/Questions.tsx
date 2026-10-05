import { Reveal } from "@/components/landing/Reveal";
import { LIGHT } from "@/components/landing/shared";

const QUESTIONS = [
  { q: "Is this member expired?", a: "Green, yellow or red in one second, with the word beside it." },
  { q: "Who still owes money?", a: "The balance shows on every member and at check-in." },
  { q: "Who should I call this week?", a: "A daily list of expiring members, with Call and Message buttons." },
];

// Section 2 (off-white): the three questions every front desk asks.
export function Questions() {
  return (
    <section className={LIGHT}>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-24">
        <Reveal as="p" className="text-sm font-semibold text-[#B34700]">
          Every front desk asks the same three things.
        </Reveal>
        <div className="mt-6">
          {QUESTIONS.map((item, i) => (
            <Reveal
              key={item.q}
              delay={i * 100}
              className="grid gap-4 border-t border-black/15 py-8 last:border-b md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-12"
            >
              <h2 className="font-heading text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
                {item.q}
              </h2>
              <p className="text-black/60 md:pb-2">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}