import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyDashboardRedirect({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/compare?id=${id}`);
}
