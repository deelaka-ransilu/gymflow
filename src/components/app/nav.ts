import type { Icon } from "@phosphor-icons/react";
import { CalendarX, FloppyDisk, House, UserCheck, Users } from "@phosphor-icons/react";

export type NavGroup = "menu" | "admin";

export type NavItem = {
  href: string;
  label: string;
  Icon: Icon;
  group: NavGroup;
  ownerOnly: boolean;
};

/** The one place that lists the app's main screens. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/app", label: "Home", Icon: House, group: "menu", ownerOnly: false },
  { href: "/app/check-in", label: "Check-in", Icon: UserCheck, group: "menu", ownerOnly: false },
  { href: "/app/members", label: "Members", Icon: Users, group: "menu", ownerOnly: false },
  { href: "/app/expiring", label: "Expiring", Icon: CalendarX, group: "menu", ownerOnly: false },
  { href: "/app/backup", label: "Backup", Icon: FloppyDisk, group: "admin", ownerOnly: true },
];

/** Home matches only itself; every other item also matches its sub-pages. */
export function isActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/$/, "");
  return href === "/app" ? path === "/app" : path.startsWith(href);
}