import { BarbellBand } from "@/components/landing/BarbellBand";
import { Nav } from "@/components/landing/Nav";
import { Closing } from "@/components/landing/sections/Closing";
import { DayAtDesk } from "@/components/landing/sections/DayAtDesk";
import { DemoRoles } from "@/components/landing/sections/DemoRoles";
import { Faq } from "@/components/landing/sections/Faq";
import { Hero } from "@/components/landing/sections/Hero";
import { Pricing } from "@/components/landing/sections/Pricing";
import { Questions } from "@/components/landing/sections/Questions";
import { StatusPlates } from "@/components/landing/sections/StatusPlates";

// The landing page is just the sections in order, with a barbell bar on each seam.
// To reorder, move a section (and its seam). To change a section, open its own file
// in src/components/landing/sections/. Shared colours and buttons live in landing/shared.tsx.
// Bar shapes (variant): wave, gentle, narrow, deep, hump, straight. Each seam uses a different one.
export default function Landing() {
  return (
    <div id="top" className="min-h-screen bg-[#121212]">
      <Nav />

      <main>
        <Hero />
        <BarbellBand from="dark" to="light" variant="wave" />
        <Questions />
        <BarbellBand from="light" to="dark" variant="gentle" />
        <StatusPlates />
        <BarbellBand from="dark" to="orange" variant="deep" />
        <DayAtDesk />
        <BarbellBand from="orange" to="light" variant="straight" />
        <DemoRoles />
        <BarbellBand from="light" to="dark" variant="narrow" />
        <Pricing />
        <BarbellBand from="dark" to="light" variant="hump" />
        <Faq />
        <BarbellBand from="light" to="orange" variant="wave" />
        <Closing />
      </main>

      <footer className="bg-[#121212] py-6 text-center text-sm text-white/60">
        Demo data stays in your browser.
      </footer>
    </div>
  );
}