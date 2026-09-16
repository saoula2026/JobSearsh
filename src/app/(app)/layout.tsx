import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <div className="absolute top-4 right-6 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-1 p-6 overflow-auto pt-16 md:pt-6">{children}</main>
    </div>
  );
}
