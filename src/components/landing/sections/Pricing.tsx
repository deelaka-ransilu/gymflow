import { Reveal } from "@/components/landing/Reveal";
import { DARK, PRIMARY_BTN, WHATSAPP_LINK } from "@/components/landing/shared";

const INCLUDED = [
  "Check-in with the green, yellow and red result",
  "Member list and printed QR cards",
  "Payments, part-payments and printed receipts",
  "Daily expiring list with Call and WhatsApp message buttons",
  "Owner and receptionist sign-ins",
  "Backup and restore",
];

// Section 6 (black): the single "Founding gym offer" card.
export function Pricing() {
  return (
    <section id="pricing" className={`scroll-mt-20 ${DARK}`}>
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-24 sm:pt-24">
        <Reveal as="h2" className="font-heading text-4xl font-semibold sm:text-6xl">
          Pricing.
        </Reveal>
        <Reveal className="mt-8 rounded-2xl border border-[#FF6A00]/40 bg-kumo-base p-8 sm:p-10">
          <h3 className="font-heading text-4xl font-semibold">Founding gym offer</h3>
          <p className="font-heading mt-1 text-3xl text-accent">Talk to us</p>
          <p className="mt-4 max-w-lg text-kumo-subtle">
            We are looking for our first gyms. Tell us how your front desk works today, and we
            will agree a fair price together.
          </p>
          <ul className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-accent">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`${PRIMARY_BTN} mt-8 px-6 py-3`}
          >
            Talk to us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}