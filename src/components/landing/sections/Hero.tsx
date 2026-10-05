import { AppPreview } from "@/components/AppPreview";
import { Reveal } from "@/components/landing/Reveal";
import { DARK, DemoButton } from "@/components/landing/shared";

// Section 1 (black): the headline, the Try the demo button and the product window.
export function Hero() {
  return (
    <div className={DARK}>
      <section className="bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(255,106,0,0.16),transparent)] px-6 pb-14 pt-28 sm:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal as="h1" className="font-heading text-6xl font-semibold leading-none sm:text-8xl">
            Run your gym from <span className="text-accent">one simple screen.</span>
          </Reveal>
          <Reveal as="p" delay={100} className="mx-auto mt-6 max-w-xl text-lg text-kumo-subtle">
            Know in one second who can come in, who owes money, and who needs to renew.
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-col items-center gap-4">
            <DemoButton />
            <p className="text-sm text-kumo-subtle">
              No sign-up. 20 sample members. Your data stays in this browser.
            </p>
            <a
              href="#day"
              className="text-sm text-kumo-subtle underline underline-offset-4 hover:text-white"
            >
              See how it works
            </a>
          </Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <AppPreview />
      </section>
    </div>
  );
}