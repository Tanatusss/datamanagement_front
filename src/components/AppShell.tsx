import Sidebar from "./Sidebar";
import Topbar from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] mt-[56px] p-6">{children}</main>
    </div>
  );
}
