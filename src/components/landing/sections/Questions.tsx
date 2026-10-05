import { Reveal } from "@/components/landing/Reveal";
import { LIGHT } from "@/components/landing/shared";
import expiredImg from "../../../assests/landing/question-expired.png";
import owesImg from "../../../assests/landing/question-owes.png";
import callImg from "../../../assests/landing/question-call.png";

const QUESTIONS = [
  {
    q: "Is this member expired?",
    a: "Green, yellow or red in one second, with the word beside it.",
    img: expiredImg,
  },
  {
    q: "Who still owes money?",
    a: "The balance shows on every member and at check-in.",
    img: owesImg,
  },
  {
    q: "Who should I call this week?",
    a: "A daily list of expiring members, with Call and Message buttons.",
    img: callImg,
  },
];

// Section 2 (off-white): the three questions every front desk asks, each with a 3D picture.
// Phone: picture above the question. Tablet and up: the question and grey line on the left,
// the picture on the right.
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
              className="grid gap-4 border-t border-black/15 py-8 last:border-b md:grid-cols-[minmax(0,1fr)_9rem] md:items-start md:gap-x-8 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-x-10"
            >
              <h2 className="font-heading text-5xl font-semibold leading-none sm:text-6xl md:col-start-1 md:row-start-1 md:text-7xl lg:text-8xl">
                {item.q}
              </h2>
              <p className="max-w-2xl text-lg text-black/70 md:col-start-1 md:row-start-2 lg:text-xl">
                {item.a}
              </p>
              {/* Decoration only, so no alt text. Above the question on phones, on the right from tablet up. */}
              <div className="order-first md:order-none md:col-start-2 md:row-span-2 md:row-start-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img.src}
                  width={item.img.width}
                  height={item.img.height}
                  alt=""
                  aria-hidden="true"
                  className="h-28 w-28 object-contain md:h-36 md:w-36 lg:h-44 lg:w-44"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}