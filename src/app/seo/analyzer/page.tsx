import { permanentRedirect } from "next/navigation";

export default function LegacyAnalyzerRedirect() {
  permanentRedirect("/analyzer");
}
