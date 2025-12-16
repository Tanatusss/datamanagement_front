import React from "react";

interface BranchRowProps {
  children: React.ReactNode;
}

export default function BranchRow({ children }: BranchRowProps) {
  return (
    <div className="flex items-center pl-4">
      <div className="w-3 border-t border-[#31458A]/70" />
      <div className="ml-2 flex-1">{children}</div>
    </div>
  );
}
