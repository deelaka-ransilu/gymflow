import Link from "next/link";

// TODO: put the real WhatsApp number here (country code, no + or spaces), e.g. "94771234567"
export const WHATSAPP_NUMBER = "94XXXXXXXXX";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I saw the GymFlow demo and I would like to know more."
)}`;

// Section colour blocks: black, off-white and orange (the brand colours).
export const DARK = "bg-[#121212] text-white";
export const LIGHT = "bg-[#F5F3EE] text-[#121212]";
export const ORANGE = "bg-[#FF6A00] text-black";

export const PRIMARY_BTN =
  "inline-block rounded-xl bg-[#FF6A00] font-bold text-black transition-colors hover:bg-[#FF8533]";
export const BLACK_BTN =
  "inline-block rounded-xl bg-black font-bold text-white transition-colors hover:bg-[#262626]";
export const OUTLINE_BLACK_BTN =
  "inline-block rounded-xl border-2 border-black font-bold text-black transition-colors hover:bg-black/10";

// "orange" button for dark and light sections, "black" button for orange sections.
export function DemoButton({
  size = "lg",
  tone = "orange",
}: {
  size?: "md" | "lg";
  tone?: "orange" | "black";
}) {
  return (
    <Link
      href="/app"
      className={`${tone === "black" ? BLACK_BTN : PRIMARY_BTN} ${
        size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3"
      }`}
    >
      Try the demo
    </Link>
  );
}