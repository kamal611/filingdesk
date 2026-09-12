import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-ink font-serif text-lg font-bold text-paper">
              F
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-ink">
              {siteConfig.name}
            </span>
          </Link>
          <p className="hidden font-sans text-xs uppercase tracking-wider text-muted sm:block">
            {siteConfig.tagline}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line py-3 font-sans text-sm font-medium text-ink">
          <Link href="/" className="hover:text-accent">
            Latest
          </Link>
          {siteConfig.categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-accent">
              {c.label}
            </Link>
          ))}
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
