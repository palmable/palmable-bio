import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BioPageView } from "@/components/bio/BioPageView";
import { getAllSlugs, getSiteBySlug } from "@/lib/sites";

// Prerender a static page for every known slug at build time.
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const site = await getSiteBySlug(slug);
  if (!site) return {};
  return {
    title: site.title,
    description: site.description,
    openGraph: {
      title: site.title,
      description: site.description,
    },
  };
}

export default async function BioPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  return <BioPageView site={site} />;
}
