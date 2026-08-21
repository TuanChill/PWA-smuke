"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export function AppNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    {
      href: "/feed",
      label: "Feed",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 8h10" />
          <path d="M7 12h10" />
          <path d="M7 16h6" />
        </svg>
      ),
    },
    {
      href: "/preferences",
      label: "You",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      href: "/commentary",
      label: "Draft",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      href: "/privacy",
      label: "Privacy",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 transition-all ${
                isActive
                  ? "text-moss font-semibold"
                  : "text-ink/60 hover:text-ink hover:bg-fog/60"
              }`}
            >
              {item.icon(isActive)}
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-moss mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
