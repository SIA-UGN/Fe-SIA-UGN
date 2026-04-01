import { ArrowUpRight } from 'lucide-react';

export default function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  valueColor,
  className = '',
}) {
  return (
    <article className={`rounded-[16px] bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className="flex h-[50px] w-[50px] items-center justify-center rounded-[12px]"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#98a2b3]" />
      </div>

      <p className="text-[13px] font-medium text-[#6a7282]">{label}</p>
      <p className="mt-1 text-[32px] font-bold leading-none" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="mt-2 text-[12px] text-[#9ca3af]">{sub}</p>
    </article>
  );
}
