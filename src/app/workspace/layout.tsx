import { AppSidebar } from "~/app/_components/app-sidebar";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-shell-mid via-shell-warm to-shell text-white">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
