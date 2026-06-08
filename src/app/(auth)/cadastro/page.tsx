import { permanentRedirect } from "next/navigation";

export default function CadastroRedirectPage() {
  permanentRedirect("/register");
}
