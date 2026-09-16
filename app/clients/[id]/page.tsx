import { notFound } from "next/navigation";
import { getClient } from "@/data/mock";
import { ClientDossier } from "@/components/client/ClientDossier";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();
  return <ClientDossier client={client} />;
}
