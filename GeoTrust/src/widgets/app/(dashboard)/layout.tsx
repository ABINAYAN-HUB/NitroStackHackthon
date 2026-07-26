import { Navigation } from "@/components/shared/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="w-[272px] shrink-0 hidden md:block" />
      <main className="flex-1 min-h-screen min-w-0 bg-gradient-mesh">
        {children}
      </main>
    </div>
  );
}
