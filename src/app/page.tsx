


// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  ScanLine,
  Folder,
  Code2,
  BarChart3,
  ShieldCheck,
  Layers,
  UploadCloud,
  Brain,
  ShoppingBag,
  FlaskConical,
  BotMessageSquare,
} from "lucide-react";

const sections = [
  {
    key: "ocr",
    label: "OCR",
    description: "ประมวลผลข้อมูลจากเอกสารอัตโนมัติด้วย AI OCR",
    icon: ScanLine,
    path: "/ocr/upload",
  },
  {
    key: "ingestion",
    label: "Ingestion",
    description:
      "ดึงข้อมูลจากหลายแหล่งเข้าสู่ระบบอัตโนมัติ รองรับไฟล์ เอกสาร API และฐานข้อมูลหลากหลายประเภท",
    icon: UploadCloud,
    path: "/ingestion/dashboard",
  },
  {
    key: "data-catalog",
    label: "Data Catalog",
    description:
      "จัดการ metadata และ data แบบครบวงจร เพื่อการค้นหาและจัดการที่ง่ายขึ้น",
    icon: Folder,
    path: "/catalog",
  },
  {
    key: "apis",
    label: "APIs",
    description:
      "เข้าถึงข้อมูลอย่างเป็นระบบผ่าน API Gateway ที่เชื่อถือได้",
    icon: Code2,
    path: "/apis",
  },
  {
    key: "visualization",
    label: "Visualization",
    description:
      "สร้าง Dashboard และกราฟสวยงามแบบ Interactive เข้าใจข้อมูลได้รวดเร็ว",
    icon: BarChart3,
    path: "/visualization",
  },
  {
    key: "governance",
    label: "Data Governance",
    description:
      "ควบคุมคุณภาพและความถูกต้องของข้อมูล พร้อมระบบกำกับดูแล",
    icon: ShieldCheck,
    path: "/governance",
  },
  {
    key: "mdm",
    label: "MDM",
    description:
      "บริหารจัดการข้อมูลหลักให้เป็นหนึ่งเดียว ป้องกันข้อมูลซ้ำซ้อน",
    icon: Layers,
    path: "/mdm",
  },
  {
    key: "mrm-ai",
    label: "MRM & AI",
    description:
      "ประเมินความเสี่ยงทางธุรกิจด้วยโมเดล Machine Learning",
    icon: Brain,
    path: "/mrm-ai",
  },
  {
    key: "marketplace",
    label: "Data Marketplace",
    description: "แหล่งรวมชุดข้อมูลพร้อมใช้งาน",
    icon: ShoppingBag,
    path: "/marketplace",
  },
  {
    key: "ai-sandbox",
    label: "AI Sandbox",
    description:
      "ทดลองโมเดล AI และ Workflow ต่างๆ ได้อย่างอิสระ",
    icon: FlaskConical,
    path: "/ai-sandbox",
  },
  {
    key: "ai-console",
    label: "AI Console",
    description:
      "ค้นหาข้อมูลผ่านภาษาธรรมชาติ เสมือนผู้ช่วยส่วนตัว",
    icon: BotMessageSquare,
    path: "/ai-console",
  },
];

export default function HomeDashboard() {
  const router = useRouter();

  return (
     <div className="-mx-6 min-h-screen bg-[#0D1117] dark-scroll">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9BA1A6]">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#F0EEE9] sm:text-3xl">
            Data Management Platform
          </h1>
          <p className="mt-2 text-sm text-[#9BA1A6]">
            เลือกโมดูลที่ต้องการเริ่มใช้งานจากรายการด้านล่าง
          </p>
        </header>

        {/* Section list */}
        <main className="rounded-3xl border border-[#30363D] bg-[#161B22] p-6 shadow-xl shadow-black/40">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === "ocr" || s.key === "ingestion";

              const cardClass = isActive
                ? "group flex h-40 flex-col rounded-2xl border border-[#30363D] bg-[#0D1117] p-5 text-left shadow-sm shadow-black/40 transition-all duration-200 hover:-translate-y-1 hover:border-sky-500 hover:shadow-lg"
                : "group flex h-40 flex-col rounded-2xl border border-[#30363D] bg-[#0D1117]/60 p-5 text-left opacity-60 cursor-not-allowed";


              const iconClass = isActive
                ? "flex h-10 w-10 items-center justify-center rounded-xl bg-[#21262D] text-[#F0EEE9] group-hover:bg-[#30363D]"
                : "flex h-10 w-10 items-center justify-center rounded-xl bg-[#161B22] text-[#9BA1A6]";

              const labelClass = isActive
                ? "text-sm font-semibold text-[#F0EEE9]"
                : "text-sm font-semibold text-[#9BA1A6]";

              const descClass = isActive
                ? "mt-3 text-xs leading-relaxed text-[#9BA1A6]"
                : "mt-3 text-xs leading-relaxed text-[#6B7280]";


              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => isActive && router.push(s.path)}
                  disabled={!isActive}
                  className={cardClass}
                >
                  <div className="flex items-center gap-3">
                    <div className={iconClass}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={labelClass}>{s.label}</h3>
                      {isActive && (
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#9BA1A6]">
                          Available
                        </p>
                      )}
                    </div>
                  </div>

                  <p className={descClass}>{s.description}</p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

