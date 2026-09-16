import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative pb-16 md:pb-0">
      <Sidebar />
      <div className="absolute top-4 right-6 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-6">{children}</main>
      <MobileNav />
    </div>
  );
}
