import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BioPageView } from "@/components/bio/BioPageView";
import { DraftBanner } from "@/components/bio/DraftBanner";
import { auth } from "@/lib/auth";
import { getAllSlugs, getSiteBySlug } from "@/lib/sites";
import { getOwnedSite } from "@/lib/sites-write";

// Prerender a static page for every known slug at build time.
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Per-site SEO / social preview metadata.
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
  let site = await getSiteBySlug(slug);
  let isDraftPreview = false;

  // Owners can preview unpublished pages at the same public URL.
  if (!site) {
    const session = await auth();
    const email = session?.user?.email;
    if (email) {
      const owned = await getOwnedSite(email, slug);
      if (owned) {
        site = owned;
        isDraftPreview = !owned.published;
      }
    }
  }

  if (!site) notFound();

  return (
    <>
      {isDraftPreview ? <DraftBanner /> : null}
      <BioPageView site={site} />
    </>
  );
}
