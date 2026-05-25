import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-zinc-950 min-h-screen">
      <Sidebar />

      <main className="flex-1">
        <Header />

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}