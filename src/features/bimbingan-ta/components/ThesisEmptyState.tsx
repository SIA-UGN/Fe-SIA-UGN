'use client';

import { Button } from '@/components/ui/button';

interface ThesisEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ThesisEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: ThesisEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[#015023]/20 bg-white p-8 text-center shadow-sm">
      <h3 className="text-xl font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button variant="primary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
