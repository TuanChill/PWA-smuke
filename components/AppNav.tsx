import Link from "next/link";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/preferences", label: "Graph" },
  { href: "/commentary", label: "Drafts" },
  { href: "/privacy", label: "Privacy" }
] as const;

export function AppNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-xs font-semibold text-ink/64">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-2xl px-2 py-2 hover:bg-fog">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
