import { Reveal } from "@/components/landing/Reveal";
import {
  CheckInPicture,
  ExpiringPicture,
  ReceiptPicture,
} from "@/components/landing/ScreenPictures";
import { ORANGE } from "@/components/landing/shared";

const DAY = [
  {
    title: "Check the member in",
    text: "Scan the QR card, or type a name, phone number or member number. The screen turns green, yellow or red and shows the balance owed.",
    picture: <CheckInPicture />,
  },
  {
    title: "Take payment, print the receipt",
    text: "Record cash or a bank transfer. Part-payments are fine, and the balance is tracked for you. Print a receipt for the member.",
    picture: <ReceiptPicture />,
  },
  {
    title: "Call before they expire",
    text: "Each morning, see who expires today, in the next three days and later in the week. Tap Call, or send a WhatsApp reminder. Renew them when they come in.",
    picture: <ExpiringPicture />,
  },
];

// Section 4 (orange): a day at the front desk, with a small picture of each real screen.
export function DayAtDesk() {
  return (
    <section id="day" className={`scroll-mt-20 ${ORANGE}`}>
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 sm:pb-24 sm:pt-28">
        <Reveal as="h2" className="font-heading text-5xl font-semibold leading-none sm:text-7xl">
          Your day at the desk.
        </Reveal>
        <div className="mt-12 space-y-16">
          {DAY.map((row, i) => (
            <Reveal key={row.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className={i % 2 === 1 ? "md:order-last" : ""}>
                <h3 className="font-heading text-3xl font-semibold sm:text-4xl">{row.title}</h3>
                <p className="mt-3 max-w-md text-black/75">{row.text}</p>
              </div>
              <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/30">{row.picture}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}