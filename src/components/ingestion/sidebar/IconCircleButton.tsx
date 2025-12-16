import { Plus } from "lucide-react";

interface IconCircleButtonProps {
  onClick: () => void;
}

export default function IconCircleButton({ onClick }: IconCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md 
                 border border-[#4A6FF3]/40 bg-[#4A6FF3]/15 
                 text-[#EAF1FF] hover:bg-[#4A6FF3]/30 hover:text-white"
    >
      <Plus className="h-3 w-3" />
    </button>
  );
}
