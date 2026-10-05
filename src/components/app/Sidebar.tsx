"use client";

import Link from "next/link";
import { Barbell, CaretLeft, CaretRight, MagnifyingGlass, SignOut, X } from "@phosphor-icons/react";
import type { Role } from "@/db/types";
import { MemberSearch } from "./MemberSearch";
import { NAV_ITEMS, isActive, type NavGroup, type NavItem } from "./nav";

const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  receptionist: "Receptionist",
};

const GROUPS: { key: NavGroup; label: string }[] = [
  { key: "menu", label: "Menu" },
  { key: "admin", label: "Admin" },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type SidebarProps = {
  role: Role;
  pathname: string;
  onSignOut: () => void;
  /** Small count shown next to a nav item, keyed by its href. */
  badges?: Record<string, number | undefined>;
  /** Icon-only mode (desktop). */
  collapsed?: boolean;
  /** Pass this to show the collapse button on the sidebar edge (desktop). */
  onToggleCollapsed?: () => void;
  /** Pass this to show a close button (mobile drawer). */
  onClose?: () => void;
  /** Called after a link is clicked, so the drawer can close. */
  onNavigate?: () => void;
  /** Width and animation classes, set by the parent. */
  className?: string;
};

function NavLink({
  item,
  active,
  collapsed,
  badge,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  const { href, label, Icon } = item;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl border p-1.5 text-sm font-medium transition-colors ${
        collapsed ? "justify-center" : "pr-3"
      } ${
        active
          ? "border-[#3a3a3a] bg-[#2a2a2a] text-kumo-default shadow-lg shadow-black/30"
          : "border-transparent text-kumo-subtle hover:bg-white/5 hover:text-kumo-default"
      } ${FOCUS}`}
    >
      <span
        className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          active ? "bg-accent text-black" : "bg-white/5"
        }`}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} />
        {collapsed && badge ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FACC15] ring-2 ring-[#1c1c1c]"
          />
        ) : null}
      </span>
      <span className={collapsed ? "sr-only" : undefined}>{label}</span>
      {badge ? (
        collapsed ? (
          <span className="sr-only">, {badge}</span>
        ) : (
          <span className="ml-auto rounded-full bg-[#FACC15]/15 px-2 py-0.5 text-xs font-semibold text-[#FACC15]">
            {badge}
          </span>
        )
      ) : null}
    </Link>
  );
}

/** Purely presentational: it gets everything through props and knows nothing about the demo. */
export function Sidebar({
  role,
  pathname,
  onSignOut,
  badges = {},
  collapsed = false,
  onToggleCollapsed,
  onClose,
  onNavigate,
  className = "",
}: SidebarProps) {
  const visible = NAV_ITEMS.filter((n) => !n.ownerOnly || role === "owner");
  const sections = GROUPS.map((g) => ({
    ...g,
    items: visible.filter((n) => n.group === g.key),
  })).filter((s) => s.items.length > 0);

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const avatar = (
    <span
      aria-hidden="true"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-base font-semibold text-black ring-2 ring-accent/30"
    >
      {ROLE_LABEL[role].charAt(0)}
    </span>
  );

  return (
    // The outer box is not clipped, so the collapse button can sit on the sidebar edge.
    <div className={`relative flex ${className}`}>
      <aside className="flex min-w-0 flex-1 flex-col overflow-hidden bg-kumo-base">
        {/* Logo */}
        <div
          className={`flex items-center pb-4 pt-5 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <Link
            href="/app"
            onClick={onNavigate}
            aria-label="GymFlow home"
            className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-black"
            >
              <Barbell size={22} weight="bold" />
            </span>
            {!collapsed && (
              <span className="font-heading text-2xl font-semibold leading-none">
                Gym<span className="text-accent">Flow</span>
              </span>
            )}
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className={`grid h-10 w-10 place-items-center rounded-lg text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default ${FOCUS}`}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className={collapsed ? "mx-3 border-t border-kumo-line" : "mx-4 border-t border-kumo-line"} />

        {/* Search */}
        <div className="px-3 pt-4">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Search members"
              title="Search members"
              className={`grid h-10 w-full place-items-center rounded-xl border border-kumo-line bg-white/5 text-kumo-subtle hover:text-kumo-default ${FOCUS}`}
            >
              <MagnifyingGlass size={18} />
            </button>
          ) : (
            <MemberSearch onNavigate={onNavigate} />
          )}
        </div>

        {/* Main navigation, in groups */}
        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-2">
          {sections.map((section, index) => (
            <div key={section.key}>
              {collapsed ? (
                index > 0 && <div className="mx-2 my-3 border-t border-kumo-line" />
              ) : (
                <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-kumo-subtle/70">
                  {section.label}
                </p>
              )}
              <div className={`space-y-1 ${collapsed && index === 0 ? "pt-4" : ""}`}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                    collapsed={collapsed}
                    badge={badges[item.href]}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Who is signed in */}
        <div className="p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              {avatar}
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
                className={`grid h-10 w-10 place-items-center rounded-lg text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default ${FOCUS}`}
              >
                <SignOut size={20} />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-kumo-line bg-kumo-tint p-3">
              <div className="flex items-center gap-3">
                {avatar}
                <div className="min-w-0">
                  <div className="text-xs text-kumo-subtle">Signed in as</div>
                  <div className="truncate text-sm font-semibold text-kumo-default">
                    {ROLE_LABEL[role]}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className={`mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-black/30 text-sm font-medium text-kumo-default hover:bg-white/10 ${FOCUS}`}
              >
                <SignOut size={18} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Collapse button on the sidebar edge */}
      {onToggleCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          title={toggleLabel}
          className={`absolute -right-3 top-7 z-20 grid h-6 w-6 place-items-center rounded-full border border-kumo-line bg-kumo-tint text-kumo-subtle shadow-md after:absolute after:-inset-2 hover:border-accent hover:text-accent ${FOCUS}`}
        >
          {collapsed ? <CaretRight size={14} weight="bold" /> : <CaretLeft size={14} weight="bold" />}
        </button>
      )}
    </div>
  );
}