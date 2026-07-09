import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-mainPrimary",
  iconColor = "text-white",
}: SummaryCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutralLight border border-neutralMed p-custom-16 shadow-sm">
      <div className="flex flex-col gap-custom-8">
        <p className="text-xs text-neutralPrimary">
          {title}
        </p>

        <h2 className="text-tertiaryHeader font-bold text-mainPrimary">
          {value}
        </h2>
      </div>

      <div
        className={`
          w-12
          h-12
          rounded-xl
          flex
          items-center
          justify-center
          ${iconBg}
        `}
      >
        <Icon
          className={`w-6 h-6 ${iconColor}`}
        />
      </div>
    </div>
  );
}