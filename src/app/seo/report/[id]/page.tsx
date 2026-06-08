import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyReportRedirect({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/reports/${id}`);
}
