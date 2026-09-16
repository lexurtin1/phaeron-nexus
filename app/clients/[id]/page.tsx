"use client";

import { ClientDossier } from "@/components/client/ClientDossier";
import { use } from "react";

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ClientDossier clientId={id} />;
}
