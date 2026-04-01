export default function StatBanner({
  total = 0,
  totalLabel = 'Total Pengajuan TA',
  totalSubLabel = 'Pengajuan tercatat',
  breakdown = [],
  icon,
}) {
  return (
    <section className="rounded-[16px] bg-[linear-gradient(173deg,#015023_0%,#013d1c_100%)] p-5 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)] lg:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[18px] font-semibold text-white">{totalLabel}</p>
          <p className="mt-1 text-[36px] font-bold leading-none text-white">{total}</p>
          <p className="mt-2 text-[14px] text-[#dabc4e]">{totalSubLabel}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-7">
          {breakdown.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-white/60">{item.label}</p>
              <p className="mt-1 text-[22px] font-bold" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="self-start rounded-[16px] bg-[linear-gradient(135deg,#f3cf68_0%,#dabc4e_100%)] p-4 text-[#015023] shadow-inner">
          <div className="h-8 w-8">{icon}</div>
        </div>
      </div>
    </section>
  );
}
