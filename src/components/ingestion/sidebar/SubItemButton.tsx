import React from "react";

interface SubItemButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function SubItemButton({ label, active, onClick }: SubItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group/nav flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-left",
        active
          ? "bg-[#3157E0]/35 text-[#EAF1FF]"
          : "text-[#D4E0FF] hover:text-white hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full transition-opacity",
          active
            ? "bg-[#AFC6FF] opacity-100"
            : "bg-[#AFC6FF]/0 group-hover/nav:opacity-80",
        ].join(" ")}
      />
      {label}
    </button>
  );
}
