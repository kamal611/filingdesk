import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="prose-article max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-ink">Contact {siteConfig.name}</h1>
      <p className="mt-4 text-muted">
        For corrections, questions, or licensing inquiries, reach us at{" "}
        <a className="text-accent hover:underline" href="mailto:editors@example.com">
          editors@example.com
        </a>
        . (Replace with your real contact address before launch.)
      </p>
    </div>
  );
}
