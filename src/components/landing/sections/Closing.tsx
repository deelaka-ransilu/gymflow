import { Reveal } from "@/components/landing/Reveal";
import { DemoButton, ORANGE, OUTLINE_BLACK_BTN, WHATSAPP_LINK } from "@/components/landing/shared";

// Section 8 (orange): the final Try the demo button, with WhatsApp as the second option.
export function Closing() {
  return (
    <section id="contact" className={`scroll-mt-20 ${ORANGE}`}>
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 text-center sm:pb-28 sm:pt-32">
        <Reveal as="h2" className="font-heading text-5xl font-semibold leading-none sm:text-7xl">
          Try it with 20 sample members.
        </Reveal>
        <Reveal as="p" delay={100} className="mx-auto mt-4 max-w-md text-black/75">
          Five minutes is enough to see if it fits your front desk.
        </Reveal>
        <Reveal delay={200} className="mt-8 flex flex-col items-center gap-4">
          <DemoButton tone="black" />
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`${OUTLINE_BLACK_BTN} px-6 py-3`}
          >
            Talk to us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}