'use client';

interface ThesisKeyValueListProps {
  items: Array<{ label: string; value: any }>;
}

export default function ThesisKeyValueList({ items }: ThesisKeyValueListProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {item.value ?? '-'}
          </dd>
        </div>
      ))}
    </dl>
  );
}
