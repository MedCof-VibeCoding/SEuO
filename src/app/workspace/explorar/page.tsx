import { SavedTextsPanel } from "~/app/workspace/explorar/_components/saved-texts-panel";

export default function ExplorarPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-bright">Explorar</h1>
      <p className="mt-4 text-white/65">
        Exemplo mínimo: textos salvos no MongoDB via tRPC.
      </p>
      <SavedTextsPanel />
    </div>
  );
}
