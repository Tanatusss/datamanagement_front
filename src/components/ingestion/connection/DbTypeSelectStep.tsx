import React from "react";
import { DbType } from "../dbCatalog";
import { DB_SECTIONS } from "../dbCatalog";

type Props = {
  sections: typeof DB_SECTIONS;
  selectedType: DbType | null;
  enabledTypes: DbType[]; // ตัวที่กดแล้วไปหน้าถัดไปได้
  onSelectType: (type: DbType) => void;
};

export function DbTypeSelectStep({
  sections,
  selectedType,
  enabledTypes,
  onSelectType,
}: Props) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {section.label}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {section.items.map((item) => {
              const isEnabled = enabledTypes.includes(item.type);
              const isSelected = selectedType === item.type;

              return (
                <button
                  key={item.type}
                  type="button"
                  disabled={!isEnabled}
                  onClick={() => isEnabled && onSelectType(item.type)}
                  className={[
                    "h-24 rounded-xl border text-xs sm:text-sm font-medium",
                    "flex flex-col items-center justify-center gap-2",
                    "transition-colors duration-150",
                    isEnabled
                      ? "bg-[#020617] text-[#E5E7EB] border-[#1F2937] hover:border-sky-500 hover:bg-[#020617]/90"
                      : "bg-[#020617]/40 text-[#6B7280] border-[#111827] cursor-not-allowed opacity-60",
                    isEnabled && isSelected
                      ? "border-sky-500 ring-1 ring-sky-400"
                      : "",
                  ].join(" ")}
                >
                  {/* icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#020617]/80 ring-1 ring-[#1F2937]">
                    <img
                      src={item.icon}
                      alt={item.type}
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                  <span className="px-1 text-center leading-snug">
                    {item.type}
                    {!isEnabled && (
                      <span className="mt-0.5 block text-[10px] text-[#6B7280]">
                        Coming soon
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
