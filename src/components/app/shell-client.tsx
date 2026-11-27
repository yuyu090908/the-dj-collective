"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import { stripLocale } from "@/lib/i18n/config";

export type NavItem = { href: string; label: string; icon: React.ReactNode; phase?: number };
export type NavGroup = { label: string; items: NavItem[] };

function Icon({ name }: { name: React.ReactNode; size?: number }) {
  return <span className="grid h-5 w-5 shrink-0 place-items-center [&>svg]:h-[18px] [&>svg]:w-[18px]" aria-hidden="true">{name}</span>;
}

function useActive() {
  const p = stripLocale(usePathname());
  return (href: string) => p === href || (href !== "/" && p.startsWith(href + "/"));
}

const prefix = (localePrefix: string, href: string) => (href.startsWith("http") ? href : `${localePrefix}${href}`);

export function Sidebar({ groups, localePrefix, labels, footer }: { groups: NavGroup[]; localePrefix: string; labels: { collapse: string; expand: string }; footer?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const isActive = useActive();
  useEffect(() => {
    // Hydrate persisted UI preference after mount (localStorage is unavailable on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem("djc_sidebar") === "1");
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("djc_sidebar", c ? "0" : "1");
      return !c;
    });
  };
  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-ink transition-[width] duration-200 lg:flex ${collapsed ? "w-[68px]" : "w-[236px]"}`}
      aria-label="Sidebar"
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            {!collapsed && <p className="kicker mb-2 px-2 !text-[0.6875rem]">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={prefix(localePrefix, it.href)}
                      title={collapsed ? it.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-[6px] px-2.5 text-sm transition-colors ${
                        active ? "bg-ink-3 text-ivory" : "text-ivory/70 hover:bg-ink-2 hover:text-ivory"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      <span className={active ? "text-lime" : ""}><Icon name={it.icon} /></span>
                      {!collapsed && <span className="truncate">{it.label}</span>}
                      {!collapsed && it.phase && <span className="ml-auto rounded-[3px] border border-line px-1 text-[0.625rem] text-stone">P{it.phase}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        {!collapsed && footer}
        <button type="button" onClick={toggle} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-[6px] text-sm text-stone hover:text-ivory" aria-label={collapsed ? labels.expand : labels.collapse}>
          {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> <span>{labels.collapse}</span></>}
        </button>
      </div>
    </aside>
  );
}

export function BottomNav({ items, localePrefix }: { items: NavItem[]; localePrefix: string }) {
  const isActive = useActive();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur lg:hidden" style={{ paddingBottom: "var(--safe-b)" }}>
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <li key={it.href}>
              <Link href={prefix(localePrefix, it.href)} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] ${active ? "text-lime" : "text-stone"}`}>
                <Icon name={it.icon} size={20} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileDrawer({ groups, localePrefix, title, footer }: { groups: NavGroup[]; localePrefix: string; title: string; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = useActive();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-[6px] border border-line lg:hidden">
        <Menu size={20} />
        <span className="sr-only">{title}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[12px] border-t border-line bg-ink-2 px-4 pt-3" style={{ paddingBottom: "calc(1rem + var(--safe-b))" }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto h-1 w-10 rounded-full bg-line" aria-hidden="true" />
              <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center"><X size={20} /><span className="sr-only">Close</span></button>
            </div>
            {groups.map((g) => (
              <div key={g.label} className="mb-4">
                <p className="kicker mb-1 px-1">{g.label}</p>
                <ul className="grid grid-cols-2 gap-1">
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <Link href={prefix(localePrefix, it.href)} className={`flex min-h-12 items-center gap-2 rounded-[6px] border px-3 text-sm ${isActive(it.href) ? "border-lime/60 text-lime" : "border-line"}`}>
                        <Icon name={it.icon} size={16} />
                        <span className="truncate">{it.label}</span>
                        {it.phase && <span className="ml-auto text-[0.625rem] text-stone">P{it.phase}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
