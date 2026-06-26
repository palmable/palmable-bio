import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedSite } from "@/lib/sites-write";
import { EditorClient } from "./EditorClient";

export default async function EditorPage(props: PageProps<"/editor/[slug]">) {
  const { slug } = await props.params;

  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/dashboard");

  const site = await getOwnedSite(email, slug);
  if (!site) notFound();

  return <EditorClient site={site} />;
}
