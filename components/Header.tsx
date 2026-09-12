import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export default function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-center py-5 sm:justify-start">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-wordmark.png"
              alt={siteConfig.name}
              width={1695}
              height={305}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-line py-3 font-sans text-sm font-medium text-ink sm:justify-start">
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
