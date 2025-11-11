"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Folder,
  Code2,
  BarChart3,
  Shield,
  Server,
  CloudUpload,
  Brain,
  ShoppingBag,
  FlaskConical,
  Cpu,
  Settings,
} from "lucide-react";

type Item = { label: string; href: string };

const subMenus = (prefix: string): Item[] => [
  { label: "Menu 1", href: `/${prefix}/menu1` },
  { label: "Menu 2", href: `/${prefix}/menu2` },
  { label: "Menu 3", href: `/${prefix}/menu3` },
];

const sections = [
  { key: "ocr", label: "OCR", icon: Database },
  { key: "catalog", label: "Data Catalog", icon: Folder },
  { key: "apis", label: "APIs", icon: Code2 },
  { key: "visualization", label: "Visualization", icon: BarChart3 },
  { key: "governance", label: "Data Governance", icon: Shield },
  { key: "mdm", label: "MDM", icon: Server },
  { key: "ingestion", label: "Ingestion", icon: CloudUpload },
  { key: "mrm-ai", label: "MRM & AI", icon: Brain },
  { key: "marketplace", label: "Data Marketplace", icon: ShoppingBag },
  { key: "sandbox", label: "AI Sandbox", icon: FlaskConical },
  { key: "console", label: "AI Console", icon: Cpu },
];

const adminMenus: Item[] = [
  { label: "Menu 1", href: "/admin/menu1" },
  { label: "Menu 2", href: "/admin/menu2" },
  { label: "Menu 3", href: "/admin/menu3" },
  { label: "Menu 4", href: "/admin/menu4" },
];

function NavItem({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`block px-4 py-1.5 text-sm rounded-md transition-all duration-200 ${
        active
          ? "bg-cyan-500/20 text-cyan-300 font-medium"
          : "text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-200"
      }`}
    >
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="fixed top-0 left-0 z-50 flex flex-col h-screen w-60
                 bg-gradient-to-b from-slate-950 to-slate-800 border-r border-slate-700/40
                 shadow-[inset_-1px_0_0_#0f172a] overflow-y-scroll no-scrollbar"
    >
      {/* LOGO */}
      <Link href="/" className="no-underline">
        <div className="flex items-center gap-2 px-5 py-4 text-white font-semibold text-lg cursor-pointer hover:bg-white/5 transition">
          <Image
            src="/bol2.png"
            alt="BOL Datastore"
            width={100}
            height={100}
            className="object-contain"
          />
          <span className="tracking-wide">BOL Datastore</span>
        </div>
      </Link>

      {/* MAIN MENU */}
      <nav className="flex-1 px-2 pb-6 space-y-1.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.key} className="group">
              <button
                onClick={() => toggleMenu(sec.key)}
                className={`flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  openMenu === sec.key
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "hover:bg-white/5 text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300
                      ${
                        openMenu === sec.key
                          ? "bg-cyan-500/20"
                          : "bg-cyan-900/30 group-hover:bg-cyan-800/40"
                      }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors duration-200 ${
                        openMenu === sec.key
                          ? "text-cyan-300"
                          : "text-cyan-400 group-hover:text-cyan-300"
                      }`}
                    />
                  </div>
                  <span>{sec.label}</span>
                </div>
                {openMenu === sec.key ? (
                  <ChevronDown className="h-4 w-4 text-cyan-300" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-cyan-400" />
                )}
              </button>

              {/* Submenu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenu === sec.key
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-6 mt-1 space-y-1">
                  {subMenus(sec.key).map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ADMIN */}
      <div className="border-t border-slate-700/40 mt-auto backdrop-blur-sm">
        <div className="px-2 py-3">
          <button
            onClick={() => toggleMenu("admin")}
            className={`flex items-center justify-between w-full px-3 py-1.5 text-sm font-semibold text-white rounded-md transition-all duration-200 ${
              openMenu === "admin" ? "bg-cyan-500/15" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300
                ${
                  openMenu === "admin"
                    ? "bg-cyan-500/20"
                    : "bg-cyan-900/30 hover:bg-cyan-800/40"
                }`}
              >
                <Settings
                  className={`h-4 w-4 ${
                    openMenu === "admin"
                      ? "text-cyan-300"
                      : "text-cyan-400 hover:text-cyan-300"
                  }`}
                />
              </div>
              <span>ADMIN</span>
            </div>
            {openMenu === "admin" ? (
              <ChevronDown className="h-4 w-4 text-cyan-300" />
            ) : (
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openMenu === "admin" ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-6 mt-1 space-y-1">
              {adminMenus.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
