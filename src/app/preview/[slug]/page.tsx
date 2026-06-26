import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BioPageView } from "@/components/bio/BioPageView";
import { DraftBanner } from "@/components/bio/DraftBanner";
import { auth } from "@/lib/auth";
import { getOwnedSite } from "@/lib/sites-write";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/preview/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { title: "Preview" };
  const site = await getOwnedSite(email, slug);
  if (!site) return {};
  return { title: `${site.title} (preview)` };
}

/** Owner-only draft preview — must not be mixed into the static public /[slug] route. */
export default async function PreviewPage(props: PageProps<"/preview/[slug]">) {
  const { slug } = await props.params;
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/dashboard");

  const site = await getOwnedSite(email, slug);
  if (!site) notFound();

  return (
    <>
      <DraftBanner />
      <BioPageView site={site} />
    </>
  );
}
